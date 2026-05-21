import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  iniciarExamen, getIntentoEnProgreso, autosaveIntento, entregarIntento,
} from '@/lib/examenes';
import { ApiError } from '@/lib/api';
import type { IntentoActivo } from '@/types/cognitaai';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ChevronLeft, ChevronRight, Flag, Send,
  Clock, AlertCircle, Loader2,
} from 'lucide-react';

const ExamEngine = () => {
  const { id: examId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const intentoQuery = searchParams.get('intento');
  const navigate = useNavigate();

  const [intento, setIntento] = useState<IntentoActivo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tickTime, setTickTime] = useState(Date.now());

  const deadlineRef = useRef<number>(0); // ms epoch
  const initStartedRef = useRef(false);

  // 1. Iniciar / retomar intento
  useEffect(() => {
    if (!examId || initStartedRef.current) return;
    initStartedRef.current = true;

    const init = async () => {
      try {
        let data: IntentoActivo | null = null;
        if (intentoQuery) {
          data = await getIntentoEnProgreso();
          if (!data || data.exam_id !== examId) {
            data = await iniciarExamen(examId);
          }
        } else {
          data = await iniciarExamen(examId);
        }
        if (!data) throw new Error('No se pudo iniciar el examen');

        setIntento(data);
        deadlineRef.current = Date.now() + data.tiempo_restante_seg * 1000;
        if (data.progreso_guardado) {
          setRespuestas(data.progreso_guardado.respuestas ?? {});
          setMarcadas(new Set(data.progreso_guardado.marcadas ?? []));
        }
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Error al iniciar el examen';
        const codigo = err instanceof ApiError ? err.codigo : undefined;
        setLoadError(msg);
        toast.error(msg);
        if (codigo === 'MAX_ATTEMPTS_REACHED' || codigo === 'EXAM_EXPIRED' || codigo === 'INVALID_STATE') {
          setTimeout(() => navigate('/dashboard/examenes', { replace: true }), 1500);
        }
      }
    };
    init();
  }, [examId, intentoQuery, navigate]);

  // 2. Timer basado en deadline real (resistente a throttling)
  useEffect(() => {
    if (!intento) return;
    const tick = () => setTickTime(Date.now());
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [intento]);

  const tiempoRestante = intento ? Math.max(0, Math.floor((deadlineRef.current - tickTime) / 1000)) : 0;

  // 3. Autosave heartbeat cada 30s + corrige drift
  const autosaveMut = useMutation({
    mutationFn: () => {
      if (!intento) throw new Error('Sin intento');
      return autosaveIntento(intento.intento_id, {
        respuestas,
        marcadas: Array.from(marcadas),
      });
    },
    onSuccess: (res) => {
      // Sincronizar deadline con el servidor para eliminar drift
      deadlineRef.current = Date.now() + res.tiempo_restante_seg * 1000;
    },
    onError: () => {
      // silencioso, el próximo tick reintenta
    },
  });

  useEffect(() => {
    if (!intento) return;
    const iv = setInterval(() => {
      autosaveMut.mutate();
    }, 30000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intento]);

  // 4. Auto-entrega si tiempo se agota
  const entregarMut = useMutation({
    mutationFn: () => {
      if (!intento) throw new Error('Sin intento');
      return entregarIntento(intento.intento_id, {
        respuestas,
        marcadas: Array.from(marcadas),
      });
    },
    onSuccess: (res) => {
      navigate(`/resultados?intento=${res.intento_id}`, { replace: true });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al entregar');
    },
  });

  useEffect(() => {
    if (intento && tiempoRestante === 0 && !entregarMut.isPending && !entregarMut.isSuccess) {
      toast.warning('Tiempo agotado, entregando…');
      entregarMut.mutate();
    }
  }, [tiempoRestante, intento, entregarMut]);

  // Helpers
  const selectOption = useCallback((idPregunta: string, letra: string) => {
    setRespuestas((prev) => ({ ...prev, [idPregunta]: letra }));
  }, []);

  const toggleDuda = useCallback((idPregunta: string) => {
    setMarcadas((prev) => {
      const next = new Set(prev);
      next.has(idPregunta) ? next.delete(idPregunta) : next.add(idPregunta);
      return next;
    });
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm text-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => navigate('/dashboard/examenes')}>Volver</Button>
        </Card>
      </div>
    );
  }

  if (!intento) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Iniciando examen…
      </div>
    );
  }

  const preguntas = intento.preguntas;
  const current = preguntas[currentIndex];
  const answered = Object.keys(respuestas).length;
  const flagged = marcadas.size;
  const tiempoBajo = tiempoRestante < 60;

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
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)} disabled={entregarMut.isPending}>
              Volver al examen
            </Button>
            <Button className="flex-1" onClick={() => entregarMut.mutate()} disabled={entregarMut.isPending}>
              {entregarMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entregar Examen'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="h-12 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
        <span className="text-sm font-medium text-foreground truncate">{intento.exam_nombre ?? 'Examen'}</span>
        <div className="flex-1" />
        <div className={cn(
          'flex items-center gap-1.5 text-sm tabular-nums',
          tiempoBajo ? 'text-destructive font-semibold' : 'text-muted-foreground'
        )}>
          <Clock className="w-4 h-4" />
          {formatTime(tiempoRestante)}
        </div>
        <Badge variant="secondary" className="text-xs tabular-nums">
          {answered}/{preguntas.length}
        </Badge>
      </header>

      <div className="border-b border-border bg-card px-4 py-2 overflow-x-auto">
        <div className="flex gap-1.5">
          {preguntas.map((p, i) => {
            const answered = !!respuestas[p.id_pregunta];
            const marked = marcadas.has(p.id_pregunta);
            return (
              <button
                key={p.id_pregunta}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-medium transition-colors shrink-0',
                  i === currentIndex && 'bg-primary text-primary-foreground',
                  i !== currentIndex && answered && 'bg-primary/10 text-primary',
                  i !== currentIndex && !answered && 'bg-secondary text-muted-foreground hover:bg-accent',
                  marked && i !== currentIndex && 'ring-2 ring-warning/50'
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Pregunta {currentIndex + 1} de {preguntas.length}
              </p>
              <p className="text-base font-medium text-foreground leading-relaxed">
                {current.enunciado}
              </p>
            </div>
            <Button
              variant={marcadas.has(current.id_pregunta) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleDuda(current.id_pregunta)}
              className={cn(
                'shrink-0',
                marcadas.has(current.id_pregunta) && 'bg-warning text-warning-foreground hover:bg-warning/90'
              )}
            >
              <Flag className="w-3.5 h-3.5 mr-1" />
              {marcadas.has(current.id_pregunta) ? 'Marcada' : 'Marcar'}
            </Button>
          </div>

          <div className="space-y-2">
            {current.opciones.map((op) => {
              const isSelected = respuestas[current.id_pregunta] === op.letra;
              return (
                <button
                  key={op.letra}
                  onClick={() => selectOption(current.id_pregunta, op.letra)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3',
                    isSelected
                      ? 'border-primary bg-primary/5 input-focus-shadow'
                      : 'border-border hover:border-muted-foreground/30 hover:bg-accent/50'
                  )}
                >
                  <span className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  )}>
                    {op.letra}
                  </span>
                  <span className="text-sm text-foreground pt-1">{op.texto}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card px-4 py-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        <div className="flex-1" />
        {currentIndex < preguntas.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)}>
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
