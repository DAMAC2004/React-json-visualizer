import { useNavigate } from 'react-router-dom';
import { mockDashboardResponse } from '@/services/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ExamenesPage = () => {
  const navigate = useNavigate();
  const { examenes_pendientes } = mockDashboardResponse;

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between">
        <h1>Exámenes</h1>
      </div>
      <div className="space-y-2">
        {examenes_pendientes.map((exam) => {
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
      </div>
    </div>
  );
};

export default ExamenesPage;
