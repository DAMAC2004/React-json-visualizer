import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHistorialDetalle } from '@/lib/historial';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, XCircle, ArrowLeft, Brain, ChevronDown, ChevronUp,
  Clock, Loader2,
} from 'lucide-react';
import { useState } from 'react';

const Results = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const intentoId = params.get('intento');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!intentoId) navigate('/dashboard/historial', { replace: true });
  }, [intentoId, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['historial-detalle', intentoId],
    queryFn: () => getHistorialDetalle(intentoId!),
    enabled: !!intentoId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando resultados…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-destructive">No se pudieron cargar los resultados.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>Volver</Button>
      </div>
    );
  }

  // Resultados aún no disponibles
  if (!data.resultados_disponibles) {
    const fecha = data.resultados_disponibles_en
      ? new Date(data.resultados_disponibles_en).toLocaleString('es-MX')
      : null;
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="max-w-md mx-auto space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
          </Button>
          <Card className="p-8 card-shadow text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Examen entregado</h1>
            <p className="text-sm text-muted-foreground">
              {fecha
                ? `Los resultados estarán disponibles el ${fecha}.`
                : 'Los resultados se mostrarán cuando el examen sea calificado.'}
            </p>
            <Button onClick={() => navigate('/dashboard/historial')} variant="outline" className="w-full">
              Ver historial
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const aprobado = data.aprobado ?? ((data.calificacion ?? 0) >= 70);
  const calificacion = data.calificacion ?? 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
        </Button>

        <Card className={cn(
          'p-6 card-shadow text-center',
          aprobado ? 'border-success/30' : 'border-destructive/30'
        )}>
          <div className={cn(
            'inline-flex items-center justify-center w-20 h-20 rounded-full mb-4',
            aprobado ? 'bg-success/10' : 'bg-destructive/10'
          )}>
            <span className={cn(
              'text-3xl font-bold tabular-nums',
              aprobado ? 'text-success' : 'text-destructive'
            )}>
              {calificacion.toFixed(0)}
            </span>
          </div>
          <h1 className="text-xl font-semibold">{aprobado ? '¡Examen Aprobado!' : 'Examen No Aprobado'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.aciertos ?? 0} aciertos de {data.total_preguntas ?? data.feedback?.length ?? 0} preguntas
          </p>
        </Card>

        {data.feedback && data.feedback.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Detalle de Respuestas</h2>
            <div className="space-y-2">
              {data.feedback.map((f, i) => {
                const isOpen = expanded === f.id_pregunta;
                return (
                  <Card key={f.id_pregunta} className="card-shadow overflow-hidden">
                    <button
                      className="w-full p-4 flex items-center gap-3 text-left"
                      onClick={() => setExpanded(isOpen ? null : f.id_pregunta)}
                    >
                      {f.es_correcto
                        ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                        : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                      <span className="text-sm text-foreground flex-1 truncate">
                        Pregunta {i + 1}
                      </span>
                      <Badge variant={f.es_correcto ? 'default' : 'destructive'} className="text-xs">
                        {f.respuesta_alumno ?? '—'}
                      </Badge>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-0 border-t border-border">
                        <p className="text-sm text-foreground mt-3">{f.enunciado}</p>
                        <div className="text-xs space-y-2 mt-3">
                          {!f.es_correcto && (
                            <p className="text-muted-foreground">
                              Respuesta correcta: <span className="font-medium text-success">{f.respuesta_correcta}</span>
                            </p>
                          )}
                          <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-lg">
                            <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-foreground">{f.explicacion}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Results;
