import { useQuery } from '@tanstack/react-query';
import { getMetricas } from '@/lib/metricas';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Flame, Target, BarChart3, Loader2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const MetricasPage = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ['metricas'], queryFn: getMetricas });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando métricas…
      </div>
    );
  }
  if (error || !data) return <p className="text-destructive">Error al cargar métricas.</p>;

  const tasaAprobacion = data.examenes_total > 0
    ? (data.examenes_aprobados / data.examenes_total) * 100
    : 0;

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <h1>Métricas</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Promedio General</span>
          </div>
          <p className="text-4xl font-bold tabular-nums text-foreground">{data.promedio_actual}</p>
          <p className="text-xs text-muted-foreground mt-1">de 100 puntos</p>
          <Progress value={data.promedio_actual} className="h-2 mt-3" />
        </Card>

        <Card className="p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-foreground">Racha de Actividad</span>
          </div>
          <p className="text-4xl font-bold tabular-nums text-foreground">{data.racha_dias}</p>
          <p className="text-xs text-muted-foreground mt-1">días consecutivos</p>
        </Card>

        <Card className="p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-foreground">Tasa de Aprobación</span>
          </div>
          <p className="text-4xl font-bold tabular-nums text-foreground">{tasaAprobacion.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.examenes_aprobados} de {data.examenes_total} exámenes
          </p>
        </Card>

        <Card className="p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-info" />
            <span className="text-sm font-medium text-foreground">Avance en Capacitaciones</span>
          </div>
          <p className="text-4xl font-bold tabular-nums text-foreground">
            {data.capacitaciones_completadas}/{data.capacitaciones_total}
          </p>
          <p className="text-xs text-muted-foreground mt-1">completadas</p>
          <Progress
            value={data.capacitaciones_total > 0 ? (data.capacitaciones_completadas / data.capacitaciones_total) * 100 : 0}
            className="h-2 mt-3"
          />
        </Card>
      </div>

      {data.evolucion_promedio && data.evolucion_promedio.length > 0 && (
        <Card className="p-5 card-shadow">
          <h2 className="text-base font-semibold text-foreground mb-4">Evolución del Promedio</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.evolucion_promedio}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="periodo" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="promedio" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MetricasPage;
