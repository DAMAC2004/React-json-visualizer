import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/lib/dashboard';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Flame, TrendingUp, BookOpen, ClipboardCheck,
  AlertTriangle, ArrowRight, Clock, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    if (data?.intento_en_progreso) setShowResume(true);
  }, [data?.intento_en_progreso]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando dashboard…
      </div>
    );
  }
  if (error || !data) {
    return <p className="text-destructive">Error al cargar el dashboard.</p>;
  }

  const { metricas, capacitaciones, examenes_pendientes, intento_en_progreso } = data;

  const getDaysUntil = (s: string) => Math.ceil((new Date(s).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1>{data.saludo ?? `Bienvenido, ${usuario?.usuario_nombre ?? ''}`}</h1>
        <p className="text-muted-foreground mt-1">{usuario?.usuario_correo}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={TrendingUp} label="Promedio" value={`${metricas.promedio_actual}`} sub="de 100" color="text-primary" />
        <MetricCard icon={Flame} label="Racha" value={`${metricas.racha_dias}`} sub="días consecutivos" color="text-warning" />
        <MetricCard icon={BookOpen} label="Capacitaciones" value={`${metricas.capacitaciones_completadas}/${metricas.capacitaciones_total}`} sub="completadas" color="text-success" />
        <MetricCard icon={ClipboardCheck} label="Exámenes" value={`${metricas.examenes_aprobados}/${metricas.examenes_total}`} sub="aprobados" color="text-info" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Exámenes Pendientes</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('/dashboard/examenes')}>
            Ver todos <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        {examenes_pendientes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin exámenes pendientes.</p>
        ) : (
          <div className="space-y-2">
            {examenes_pendientes.map((exam) => {
              const daysLeft = exam.exam_fecha_vencimiento ? getDaysUntil(exam.exam_fecha_vencimiento) : null;
              const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
              const isOverdue = daysLeft !== null && daysLeft <= 0;
              return (
                <Card
                  key={exam.exam_id}
                  className={cn(
                    'p-4 card-shadow flex items-center gap-4 cursor-pointer hover:bg-accent/50 transition-colors',
                    isUrgent && 'border-warning/40',
                    isOverdue && 'border-destructive/40'
                  )}
                  onClick={() => navigate(`/examen/${exam.exam_id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{exam.exam_nombre}</p>
                      {isUrgent && (
                        <Badge variant="outline" className="text-warning border-warning/40 text-xs shrink-0">
                          <AlertTriangle className="w-3 h-3 mr-1" />{daysLeft}d
                        </Badge>
                      )}
                      {exam.estado_intento === 'EN_PROGRESO' && (
                        <Badge variant="outline" className="text-primary border-primary/40 text-xs shrink-0">En progreso</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exam.capaci_nombre} · {exam.total_preguntas} preguntas · {exam.exam_dificultad}
                    </p>
                  </div>
                  {exam.exam_fecha_vencimiento && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(exam.exam_fecha_vencimiento).toLocaleDateString('es-MX')}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Mis Capacitaciones</h2>
        {capacitaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin capacitaciones inscritas.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {capacitaciones.map((cap) => (
              <Card key={cap.capaci_id} className="p-4 card-shadow">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-foreground leading-snug">{cap.capaci_nombre}</p>
                  <Badge variant="secondary" className="text-xs shrink-0 ml-2">{cap.estado_inscripcion}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="tabular-nums font-medium text-foreground">{cap.progreso}%</span>
                  </div>
                  <Progress value={cap.progreso} className="h-1.5" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {intento_en_progreso && (
        <AlertDialog open={showResume} onOpenChange={setShowResume}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tienes un examen en curso</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{intento_en_progreso.exam_nombre}</strong>
                {intento_en_progreso.capaci_nombre && ` · ${intento_en_progreso.capaci_nombre}`}
                <br />
                Tiempo restante: {Math.floor(intento_en_progreso.tiempo_restante_seg / 60)} min.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Más tarde</AlertDialogCancel>
              <AlertDialogAction onClick={() => navigate(`/examen/${intento_en_progreso.exam_id}?intento=${intento_en_progreso.intento_id}`)}>
                Retomar examen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string;
}) {
  return (
    <Card className="p-4 card-shadow">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', color)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </Card>
  );
}

export default Dashboard;
