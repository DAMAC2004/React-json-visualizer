import { useNavigate } from 'react-router-dom';
import { mockDashboardResponse } from '@/services/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, BookOpen, ClipboardList } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const ExamenesPage = () => {
  const navigate = useNavigate();
  const { examenes_pendientes, capacitaciones } = mockDashboardResponse;

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Group exams by capacitación
  const grouped = capacitaciones.map(cap => ({
    cap,
    exams: examenes_pendientes.filter(e => e.id_capacitacion === cap.id_capacitacion),
  })).filter(g => g.exams.length > 0);

  const [openSections, setOpenSections] = useState<Record<number, boolean>>(
    () => Object.fromEntries(grouped.map(g => [g.cap.id_capacitacion, true]))
  );

  const toggle = (id: number) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1>Exámenes</h1>
        <p className="text-muted-foreground mt-1">
          {examenes_pendientes.length} exámenes pendientes · {grouped.length} capacitaciones
        </p>
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay exámenes pendientes</p>
        </div>
      )}

      {grouped.map(({ cap, exams }) => (
        <Collapsible
          key={cap.id_capacitacion}
          open={openSections[cap.id_capacitacion]}
          onOpenChange={() => toggle(cap.id_capacitacion)}
        >
          <CollapsibleTrigger className="flex items-center gap-3 w-full text-left group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{cap.nombre_capacitacion}</p>
              <p className="text-xs text-muted-foreground">{exams.length} exámenes</p>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              openSections[cap.id_capacitacion] && "rotate-180"
            )} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 mt-2 ml-11">
            {exams.map((exam) => {
              const daysLeft = exam.fecha_limite ? getDaysUntil(exam.fecha_limite) : null;
              const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
              return (
                <Card key={exam.id_examen} className="p-4 card-shadow flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{exam.titulo}</p>
                      {isUrgent && (
                        <Badge variant="outline" className="text-warning border-warning/40 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />{daysLeft}d
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">{exam.nivel_dificultad}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{exam.tema} · {exam.total_preguntas} preguntas</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.fecha_limite && new Date(exam.fecha_limite).toLocaleDateString('es-MX')}
                    </span>
                    <Button size="sm" onClick={() => navigate(`/examen/${exam.id_examen}`)}>
                      {exam.estado_intento === 'EN_PROGRESO' ? 'Continuar' : 'Iniciar'}
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
