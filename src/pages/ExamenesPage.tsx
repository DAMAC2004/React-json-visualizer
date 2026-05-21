import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listExamenes } from '@/lib/examenes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, AlertTriangle, BookOpen, ClipboardList, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import type { ExamenListItem } from '@/types/cognitaai';

const ExamenesPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ['examenes'], queryFn: () => listExamenes() });

  const grouped = useMemo(() => {
    const map = new Map<string, { capaci_nombre: string; exams: ExamenListItem[] }>();
    (data?.items ?? []).forEach((e) => {
      const key = e.capaci_id;
      if (!map.has(key)) map.set(key, { capaci_nombre: e.capaci_nombre, exams: [] });
      map.get(key)!.exams.push(e);
    });
    return Array.from(map.entries()).map(([capaci_id, v]) => ({ capaci_id, ...v }));
  }, [data]);

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !(p[id] ?? true) }));
  const isOpen = (id: string) => open[id] ?? true;

  const getDaysUntil = (s: string) => Math.ceil((new Date(s).getTime() - Date.now()) / 86400000);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando exámenes…
      </div>
    );
  }
  if (error || !data) return <p className="text-destructive">Error al cargar exámenes.</p>;

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1>Exámenes</h1>
        <p className="text-muted-foreground mt-1">
          {data.total} exámenes · {grouped.length} capacitaciones
        </p>
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay exámenes disponibles</p>
        </div>
      )}

      {grouped.map(({ capaci_id, capaci_nombre, exams }) => (
        <Collapsible key={capaci_id} open={isOpen(capaci_id)} onOpenChange={() => toggle(capaci_id)}>
          <CollapsibleTrigger className="flex items-center gap-3 w-full text-left group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{capaci_nombre}</p>
              <p className="text-xs text-muted-foreground">{exams.length} exámenes</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen(capaci_id) && 'rotate-180')} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 mt-2 ml-11">
            {exams.map((exam) => {
              const daysLeft = exam.exam_fecha_vencimiento ? getDaysUntil(exam.exam_fecha_vencimiento) : null;
              const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
              const sinIntentos = exam.intentos_realizados >= exam.exam_intentos_max;
              return (
                <Card key={exam.exam_id} className="p-4 card-shadow flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{exam.exam_nombre}</p>
                      {isUrgent && (
                        <Badge variant="outline" className="text-warning border-warning/40 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />{daysLeft}d
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">{exam.exam_dificultad}</Badge>
                      {exam.estado_intento === 'EN_PROGRESO' && (
                        <Badge variant="outline" className="text-primary border-primary/40 text-xs">En progreso</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exam.total_preguntas} preguntas · {exam.exam_tiempo_limite} min · intentos {exam.intentos_realizados}/{exam.exam_intentos_max}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {exam.exam_fecha_vencimiento && (
                      <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(exam.exam_fecha_vencimiento).toLocaleDateString('es-MX')}
                      </span>
                    )}
                    <Button
                      size="sm"
                      disabled={sinIntentos && exam.estado_intento !== 'EN_PROGRESO'}
                      onClick={() => navigate(`/examen/${exam.exam_id}`)}
                    >
                      {exam.estado_intento === 'EN_PROGRESO' ? 'Continuar' : sinIntentos ? 'Sin intentos' : 'Iniciar'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default ExamenesPage;
