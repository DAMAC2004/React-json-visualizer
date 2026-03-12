import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockPreguntas, calculateResults } from '@/services/mockData';
import type { RespuestaDetalle, Pregunta } from '@/types/cognitaai';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Flag, Send,
  Clock, AlertCircle, CheckCircle2
} from 'lucide-react';

const ExamEngine = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const preguntas = mockPreguntas;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaDetalle[]>(
    preguntas.map((p) => ({
      id_pregunta: p.id_pregunta,
      opcion_elegida: null,
      tiempo_segundos: 0,
      duda: false,
    }))
  );
  const [globalTimer, setGlobalTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const lastSaveRef = useRef(0);

  const currentPregunta = preguntas[currentIndex];

  // Global timer
  useEffect(() => {
    const interval = setInterval(() => setGlobalTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Per-question timer
  useEffect(() => {
    setQuestionTimer(0);
    const interval = setInterval(() => setQuestionTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Save question time on navigation
  const saveQuestionTime = useCallback(() => {
    setRespuestas((prev) =>
      prev.map((r, i) =>
        i === currentIndex ? { ...r, tiempo_segundos: r.tiempo_segundos + questionTimer } : r
      )
    );
  }, [currentIndex, questionTimer]);

  // Autosave heartbeat every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      lastSaveRef.current = globalTimer;
      console.log('[Autosave] Heartbeat enviado al servidor', { globalTimer, respuestas });
    }, 30000);
    return () => clearInterval(interval);
  }, [globalTimer, respuestas]);

  const selectOption = (option: string) => {
    setRespuestas((prev) =>
      prev.map((r) =>
        r.id_pregunta === currentPregunta.id_pregunta
          ? { ...r, opcion_elegida: option }
          : r
      )
    );
  };

  const toggleDuda = () => {
    setRespuestas((prev) =>
      prev.map((r) =>
        r.id_pregunta === currentPregunta.id_pregunta
          ? { ...r, duda: !r.duda }
          : r
      )
    );
  };

  const goTo = (idx: number) => {
    saveQuestionTime();
    setCurrentIndex(idx);
  };

  const handleSubmit = () => {
    saveQuestionTime();
    const results = calculateResults(respuestas, preguntas);
    // Store results for the results page
    sessionStorage.setItem('cognitaai_results', JSON.stringify(results));
    sessionStorage.setItem('cognitaai_exam_id', id || '0');
    navigate('/resultados');
  };

  const currentResp = respuestas[currentIndex];
  const answered = respuestas.filter((r) => r.opcion_elegida !== null).length;
  const flagged = respuestas.filter((r) => r.duda).length;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const options: { key: string; label: string; field: keyof Pregunta }[] = [
    { key: 'A', label: 'A', field: 'opcion_a' },
    { key: 'B', label: 'B', field: 'opcion_b' },
    { key: 'C', label: 'C', field: 'opcion_c' },
    { key: 'D', label: 'D', field: 'opcion_d' },
  ];

  if (showConfirm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="p-6 max-w-md w-full card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-warning" />
            <h2 className="text-lg font-semibold">Confirmar Entrega</h2>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Respondidas: <span className="font-medium text-foreground">{answered}/{preguntas.length}</span>
            </p>
            {flagged > 0 && (
              <p className="text-warning">
                <Flag className="w-3.5 h-3.5 inline mr-1" />
                {flagged} marcadas para revisión
              </p>
            )}
            {answered < preguntas.length && (
              <p className="text-destructive text-xs">
                Tienes {preguntas.length - answered} preguntas sin responder.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
              Volver al examen
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Entregar Examen
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top bar */}
      <header className="h-12 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
        <span className="text-sm font-medium text-foreground truncate">Examen #{id}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
          <Clock className="w-4 h-4" />
          {formatTime(globalTimer)}
        </div>
        <Badge variant="secondary" className="text-xs tabular-nums">
          {answered}/{preguntas.length}
        </Badge>
      </header>

      {/* Question navigator (horizontal pills) */}
      <div className="border-b border-border bg-card px-4 py-2 overflow-x-auto">
        <div className="flex gap-1.5">
          {preguntas.map((_, i) => {
            const r = respuestas[i];
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-medium transition-colors duration-100 shrink-0",
                  i === currentIndex && "bg-primary text-primary-foreground",
                  i !== currentIndex && r.opcion_elegida && "bg-primary/10 text-primary",
                  i !== currentIndex && !r.opcion_elegida && "bg-secondary text-muted-foreground hover:bg-accent",
                  r.duda && i !== currentIndex && "ring-2 ring-warning/50"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main question area */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Pregunta {currentIndex + 1} de {preguntas.length}
              </p>
              <p className="text-base font-medium text-foreground leading-relaxed">
                {currentPregunta.enunciado}
              </p>
            </div>
            <Button
              variant={currentResp.duda ? "default" : "outline"}
              size="sm"
              onClick={toggleDuda}
              className={cn(
                "shrink-0",
                currentResp.duda && "bg-warning text-warning-foreground hover:bg-warning/90"
              )}
            >
              <Flag className="w-3.5 h-3.5 mr-1" />
              {currentResp.duda ? 'Marcada' : 'Marcar'}
            </Button>
          </div>

          {/* SVG content if present */}
          {currentPregunta.svg_content && (
            <div
              className="overflow-hidden rounded-lg bg-secondary p-4"
              dangerouslySetInnerHTML={{ __html: currentPregunta.svg_content }}
            />
          )}

          {/* Options */}
          <div className="space-y-2">
            {options.map(({ key, label, field }) => {
              const isSelected = currentResp.opcion_elegida === key;
              return (
                <button
                  key={key}
                  onClick={() => selectOption(key)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex items-start gap-3",
                    isSelected
                      ? "border-primary bg-primary/5 input-focus-shadow"
                      : "border-border hover:border-muted-foreground/30 hover:bg-accent/50"
                  )}
                >
                  <span className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}>
                    {label}
                  </span>
                  <span className="text-sm text-foreground pt-1">
                    {currentPregunta[field] as string}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom navigation - fixed on mobile */}
      <div className="sticky bottom-0 border-t border-border bg-card px-4 py-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => goTo(currentIndex - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        <div className="flex-1" />
        {currentIndex < preguntas.length - 1 ? (
          <Button size="sm" onClick={() => goTo(currentIndex + 1)}>
            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={() => setShowConfirm(true)}>
            <Send className="w-4 h-4 mr-1" /> Entregar
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamEngine;
