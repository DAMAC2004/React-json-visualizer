import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardResponse } from '@/services/mockData';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Flame, TrendingUp, BookOpen, ClipboardCheck,
  AlertTriangle, PlayCircle, ArrowRight, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const data = mockDashboardResponse;
  const { metricas } = data;

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      {/* Header */}
      <div>
        <h1>Bienvenido, {user?.nombre}</h1>
        <p className="text-muted-foreground mt-1">
          {user?.perfil_alumno.carrera} · {user?.perfil_alumno.grupo}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={TrendingUp}
          label="Promedio"
          value={`${metricas.promedio_actual}`}
          sub="de 100"
          color="text-primary"
        />
        <MetricCard
          icon={Flame}
          label="Racha"
          value={`${metricas.racha_dias}`}
          sub="días consecutivos"
          color="text-warning"
        />
        <MetricCard
          icon={BookOpen}
          label="Capacitaciones"
          value={`${metricas.capacitaciones_completadas}/${metricas.capacitaciones_total}`}
          sub="completadas"
          color="text-success"
        />
        <MetricCard
          icon={ClipboardCheck}
          label="Exámenes"
          value={`${metricas.examenes_aprobados}/${metricas.examenes_total}`}
          sub="aprobados"
          color="text-info"
        />
      </div>

      {/* Exams in progress / urgent */}
      {data.examenes_pendientes.some(e => e.estado_intento === 'EN_PROGRESO') && (
        <Card className="p-4 border-warning/30 bg-warning/5 card-shadow">
          <div className="flex items-center gap-3">
            <PlayCircle className="w-5 h-5 text-warning shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Tienes un examen en progreso</p>
              <p className="text-xs text-muted-foreground">
                {data.examenes_pendientes.find(e => e.estado_intento === 'EN_PROGRESO')?.titulo}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/examen/95')}>
              Continuar Intento
            </Button>
          </div>
        </Card>
      )}

      {/* Pending exams */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Exámenes Pendientes</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('/dashboard/examenes')}>
            Ver todos <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <div className="space-y-2">
          {data.examenes_pendientes.map((exam) => {
            const daysLeft = exam.fecha_limite ? getDaysUntil(exam.fecha_limite) : null;
            const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
            const isOverdue = daysLeft !== null && daysLeft <= 0;

            return (
              <Card
                key={exam.id_examen}
                className={cn(
                  "p-4 card-shadow flex items-center gap-4 cursor-pointer transition-colors duration-100 hover:bg-accent/50",
                  isUrgent && "border-warning/40",
                  isOverdue && "border-destructive/40"
                )}
                onClick={() => navigate(`/examen/${exam.id_examen}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{exam.titulo}</p>
                    {isUrgent && (
                      <Badge variant="outline" className="text-warning border-warning/40 text-xs shrink-0">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {daysLeft}d
                      </Badge>
                    )}
                    {exam.estado_intento === 'EN_PROGRESO' && (
                      <Badge variant="outline" className="text-primary border-primary/40 text-xs shrink-0">
                        En progreso
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exam.tema} · {exam.total_preguntas} preguntas · {exam.nivel_dificultad}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {exam.fecha_limite && new Date(exam.fecha_limite).toLocaleDateString('es-MX')}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Capacitaciones */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Mis Capacitaciones</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.capacitaciones.map((cap) => (
            <Card key={cap.id_capacitacion} className="p-4 card-shadow">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-foreground leading-snug">{cap.nombre_capacitacion}</p>
                <Badge
                  variant={cap.inscripcion.estado_finalizacion === 'Completado' ? 'default' : 'secondary'}
                  className="text-xs shrink-0 ml-2"
                >
                  {cap.inscripcion.estado_finalizacion}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{cap.descripcion}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="tabular-nums font-medium text-foreground">{cap.inscripcion.progreso_total}%</span>
                </div>
                <Progress value={cap.inscripcion.progreso_total} className="h-1.5" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string;
}) {
  return (
    <Card className="p-4 card-shadow">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </Card>
  );
}

export default Dashboard;
