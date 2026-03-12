import { mockDashboardResponse } from '@/services/mockData';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Flame, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MetricasPage = () => {
  const { metricas } = mockDashboardResponse;

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <h1>Métricas</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Promedio General</span>
          </div>
          <p className="text-4xl font-bold tabular-nums text-foreground">{metricas.promedio_actual}</p>
          <p className="text-xs text-muted-foreground mt-1">de 100 puntos</p>
          <Progress value={metricas.promedio_actual} className="h-2 mt-3" />
        </Card>

        <Card className="p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-foreground">Racha de Actividad</span>
          </div>
          <p className="text-4xl font-bold tabular-nums text-foreground">{metricas.racha_dias}</p>
          <p className="text-xs text-muted-foreground mt-1">días consecutivos</p>
          <div className="flex gap-1 mt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-6 flex-1 rounded",
                  i < metricas.racha_dias ? "bg-warning/80" : "bg-secondary"
                )}
              />
            ))}
          </div>
        </Card>

        <Card className="p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-foreground">Tasa de Aprobación</span>
          </div>
          <p className="text-4xl font-bold tabular-nums text-foreground">
            {((metricas.examenes_aprobados / metricas.examenes_total) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {metricas.examenes_aprobados} de {metricas.examenes_total} exámenes
          </p>
        </Card>

        <Card className="p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-info" />
            <span className="text-sm font-medium text-foreground">Avance en Capacitaciones</span>
          </div>
          <p className="text-4xl font-bold tabular-nums text-foreground">
            {metricas.capacitaciones_completadas}/{metricas.capacitaciones_total}
          </p>
          <p className="text-xs text-muted-foreground mt-1">completadas</p>
          <Progress value={(metricas.capacitaciones_completadas / metricas.capacitaciones_total) * 100} className="h-2 mt-3" />
        </Card>
      </div>
    </div>
  );
};

export default MetricasPage;
