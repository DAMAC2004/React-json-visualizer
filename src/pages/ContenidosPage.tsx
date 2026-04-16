import { mockDashboardResponse } from '@/services/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle2, BookOpen, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const ContenidosPage = () => {
  const { contenidos, capacitaciones } = mockDashboardResponse;

  const grouped = capacitaciones.map(cap => ({
    cap,
    docs: contenidos.filter(c => c.id_capacitacion === cap.id_capacitacion),
  })).filter(g => g.docs.length > 0);

  const [openSections, setOpenSections] = useState<Record<number, boolean>>(
    () => Object.fromEntries(grouped.map(g => [g.cap.id_capacitacion, true]))
  );

  const toggle = (id: number) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1>Contenidos</h1>
        <p className="text-muted-foreground mt-1">
          {contenidos.length} documentos · {grouped.length} capacitaciones
        </p>
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay contenidos disponibles</p>
        </div>
      )}

      {grouped.map(({ cap, docs }) => (
        <Collapsible
          key={cap.id_capacitacion}
          open={openSections[cap.id_capacitacion]}
          onOpenChange={() => toggle(cap.id_capacitacion)}
        >
          <CollapsibleTrigger className="flex items-center gap-3 w-full text-left group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{cap.nombre_capacitacion}</p>
              <p className="text-xs text-muted-foreground">{docs.length} documentos</p>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              openSections[cap.id_capacitacion] && "rotate-180"
            )} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 mt-2 ml-11">
            {docs.map((doc) => (
              <Card key={doc.id_contenido} className="p-4 card-shadow flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.titulo_documento}</p>
                  <p className="text-xs text-muted-foreground">{(doc.tamaño_archivo_kb / 1024).toFixed(1)} MB</p>
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
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default ContenidosPage;
