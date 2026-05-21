import { useQuery } from '@tanstack/react-query';
import { listCapacitaciones } from '@/lib/capacitaciones';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CapacitacionListItem } from '@/types/cognitaai';

const CapacitacionesPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['capacitaciones'],
    queryFn: listCapacitaciones,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando…
      </div>
    );
  }
  if (error || !data) return <p className="text-destructive">Error al cargar capacitaciones.</p>;

  const items = data.items;
  const activas = items.filter((c) => c.estado_inscripcion === 'en_progreso' || c.estado_inscripcion === 'pendiente');
  const finalizadas = items.filter((c) => c.estado_inscripcion === 'completado');

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1>Mis Capacitaciones</h1>
        <p className="text-muted-foreground mt-1">
          {items.length} capacitaciones inscritas · {activas.length} activas
        </p>
      </div>

      <Tabs defaultValue="activas">
        <TabsList>
          <TabsTrigger value="activas">Activas ({activas.length})</TabsTrigger>
          <TabsTrigger value="finalizadas">Finalizadas ({finalizadas.length})</TabsTrigger>
          <TabsTrigger value="todas">Todas ({items.length})</TabsTrigger>
        </TabsList>

        {(['activas', 'finalizadas', 'todas'] as const).map((tab) => {
          const list = tab === 'activas' ? activas : tab === 'finalizadas' ? finalizadas : items;
          return (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
              {list.map((cap) => <CapacitacionCard key={cap.capaci_id} cap={cap} />)}
              {list.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No hay capacitaciones en esta categoría</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

function CapacitacionCard({ cap }: { cap: CapacitacionListItem }) {
  const isCompleted = cap.estado_inscripcion === 'completado';
  return (
    <Card className="card-shadow overflow-hidden">
      <div className={cn('h-2', isCompleted ? 'bg-success' : 'org-gradient')} />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-snug">{cap.capaci_nombre}</h3>
              {cap.capaci_descripcion && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cap.capaci_descripcion}</p>
              )}
            </div>
          </div>
          <Badge variant={isCompleted ? 'default' : 'secondary'} className="text-xs shrink-0">
            {cap.estado_inscripcion}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progreso general</span>
            <span className="tabular-nums font-medium text-foreground">{cap.progreso}%</span>
          </div>
          <Progress value={cap.progreso} className="h-2" />
        </div>

        {(cap.capaci_fecha_inicio || cap.capaci_fecha_fin) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {cap.capaci_fecha_inicio && new Date(cap.capaci_fecha_inicio).toLocaleDateString('es-MX')}
            {cap.capaci_fecha_fin && ` – ${new Date(cap.capaci_fecha_fin).toLocaleDateString('es-MX')}`}
          </div>
        )}
      </div>
    </Card>
  );
}

export default CapacitacionesPage;
