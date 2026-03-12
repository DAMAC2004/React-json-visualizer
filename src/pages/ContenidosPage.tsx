import { mockDashboardResponse } from '@/services/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

const ContenidosPage = () => {
  const { contenidos, capacitaciones } = mockDashboardResponse;

  const getCapName = (id: number) =>
    capacitaciones.find((c) => c.id_capacitacion === id)?.nombre_capacitacion || '';

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <h1>Contenidos</h1>
      <div className="space-y-2">
        {contenidos.map((doc) => (
          <Card key={doc.id_contenido} className="p-4 card-shadow flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{doc.titulo_documento}</p>
              <p className="text-xs text-muted-foreground">{getCapName(doc.id_capacitacion)} · {(doc.tamaño_archivo_kb / 1024).toFixed(1)} MB</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {doc.visto && <CheckCircle2 className="w-4 h-4 text-success" />}
              {doc.es_descargable && (
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm">Ver PDF</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContenidosPage;
