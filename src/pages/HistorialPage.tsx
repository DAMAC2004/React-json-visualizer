import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listHistorial } from '@/lib/historial';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

const HistorialPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ['historial'], queryFn: () => listHistorial() });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando historial…
      </div>
    );
  }
  if (error || !data) return <p className="text-destructive">Error al cargar el historial.</p>;

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1>Historial</h1>
        <p className="text-muted-foreground mt-1">{data.total} intentos registrados</p>
      </div>

      {data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin intentos previos.</p>
      ) : (
        <div className="space-y-2">
          {data.items.map((h) => {
            const aprobado = h.calificacion != null && h.calificacion >= 70;
            return (
              <Card
                key={h.intento_id}
                className="p-4 card-shadow flex items-center gap-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/resultados?intento=${h.intento_id}`)}
              >
                {h.resultados_disponibles ? (
                  aprobado
                    ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    : <XCircle className="w-5 h-5 text-destructive shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{h.exam_nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {h.capaci_nombre} · {new Date(h.inex_fecha_fin).toLocaleDateString('es-MX')}
                  </p>
                </div>
                {h.resultados_disponibles && h.calificacion != null ? (
                  <Badge variant={aprobado ? 'default' : 'destructive'} className="tabular-nums">
                    {h.calificacion.toFixed(0)}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Resultados pendientes</Badge>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistorialPage;
