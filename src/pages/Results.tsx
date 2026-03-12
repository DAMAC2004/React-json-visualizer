import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExamenResultResponse } from '@/types/cognitaai';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, ArrowLeft, Brain, ChevronDown, ChevronUp } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamenResultResponse | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('cognitaai_results');
    if (data) {
      setResults(JSON.parse(data));
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  if (!results) return null;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
        </Button>

        {/* Score card */}
        <Card className={cn(
          "p-6 card-shadow text-center",
          results.aprobado ? "border-success/30" : "border-destructive/30"
        )}>
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-full mb-4",
            results.aprobado ? "bg-success/10" : "bg-destructive/10"
          )}>
            <span className={cn(
              "text-3xl font-bold tabular-nums",
              results.aprobado ? "text-success" : "text-destructive"
            )}>
              {results.calificacion.toFixed(0)}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {results.aprobado ? '¡Examen Aprobado!' : 'Examen No Aprobado'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {results.aciertos} aciertos · {results.errores} errores · {results.total} preguntas
          </p>
        </Card>

        {/* AI Feedback */}
        <Card className="p-4 card-shadow flex items-start gap-3">
          <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-primary mb-1">Feedback de IA</p>
            <p className="text-sm text-foreground">{results.feedback_ia}</p>
          </div>
        </Card>

        {/* Detail */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Detalle de Respuestas</h2>
          <div className="space-y-2">
            {results.detalle.map((d, i) => (
              <Card key={d.id_pregunta} className="card-shadow overflow-hidden">
                <button
                  className="w-full p-4 flex items-center gap-3 text-left"
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                >
                  {d.correcta ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                  <span className="text-sm text-foreground flex-1">Pregunta {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.correcta ? 'default' : 'destructive'} className="text-xs">
                      {d.respuesta_alumno}
                    </Badge>
                    {expandedQ === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {expandedQ === i && (
                  <div className="px-4 pb-4 pt-0 border-t border-border">
                    <div className="text-xs space-y-2 mt-3">
                      {!d.correcta && (
                        <p className="text-muted-foreground">
                          Respuesta correcta: <span className="font-medium text-success">{d.respuesta_correcta}</span>
                        </p>
                      )}
                      <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-lg">
                        <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-foreground">{d.explicacion_ia}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Results;
