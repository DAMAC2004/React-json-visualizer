import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

const mockHistorial = [
  { id: 1, titulo: 'Evaluación: Intro a Python', fecha: '2026-02-20', calificacion: 92, aprobado: true },
  { id: 2, titulo: 'Evaluación: Estructuras de Datos', fecha: '2026-02-15', calificacion: 78, aprobado: true },
  { id: 3, titulo: 'Evaluación: Redes Básicas', fecha: '2026-01-28', calificacion: 60, aprobado: false },
  { id: 4, titulo: 'Evaluación: Base de Datos SQL', fecha: '2026-01-10', calificacion: 88, aprobado: true },
];

const HistorialPage = () => {
  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <h1>Historial</h1>
      <div className="space-y-2">
        {mockHistorial.map((h) => (
          <Card key={h.id} className="p-4 card-shadow flex items-center gap-4">
            {h.aprobado ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{h.titulo}</p>
              <p className="text-xs text-muted-foreground">{new Date(h.fecha).toLocaleDateString('es-MX')}</p>
            </div>
            <Badge variant={h.aprobado ? 'default' : 'destructive'} className="tabular-nums">
              {h.calificacion}%
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistorialPage;
