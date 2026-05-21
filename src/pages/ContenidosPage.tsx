import { useQueries, useQuery } from '@tanstack/react-query';
import { listCapacitaciones } from '@/lib/capacitaciones';
import { listContenidos, getContenidoUrl } from '@/lib/contenidos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, BookOpen, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

const ContenidosPage = () => {
  const { data: caps, isLoading } = useQuery({ queryKey: ['capacitaciones'], queryFn: listCapacitaciones });

  const items = caps?.items ?? [];
  const queries = useQueries({
    queries: items.map((c) => ({
      queryKey: ['contenidos', c.capaci_id],
      queryFn: () => listContenidos(c.capaci_id),
      enabled: !!items.length,
    })),
  });

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !(p[id] ?? true) }));
  const isOpen = (id: string) => open[id] ?? true;

  const handleVer = async (conten_id: string) => {
    try {
      const res = await getContenidoUrl(conten_id);
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo abrir el contenido');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando…
      </div>
    );
  }

  const grouped = items.map((cap, i) => ({
    cap,
    docs: queries[i]?.data?.items ?? [],
    loading: queries[i]?.isLoading,
  })).filter((g) => g.docs.length > 0 || g.loading);

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1>Contenidos</h1>
        <p className="text-muted-foreground mt-1">
          {grouped.reduce((s, g) => s + g.docs.length, 0)} documentos · {grouped.length} capacitaciones
        </p>
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay contenidos disponibles</p>
        </div>
      )}

      {grouped.map(({ cap, docs, loading }) => (
        <Collapsible key={cap.capaci_id} open={isOpen(cap.capaci_id)} onOpenChange={() => toggle(cap.capaci_id)}>
          <CollapsibleTrigger className="flex items-center gap-3 w-full text-left group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{cap.capaci_nombre}</p>
              <p className="text-xs text-muted-foreground">{docs.length} documentos</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen(cap.capaci_id) && 'rotate-180')} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 mt-2 ml-11">
            {loading ? (
              <p className="text-xs text-muted-foreground">Cargando…</p>
            ) : docs.map((doc) => (
              <Card key={doc.conten_id} className="p-4 card-shadow flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.conten_nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.conten_tipo}
                    {doc.conten_tamanio_kb != null && ` · ${(doc.conten_tamanio_kb / 1024).toFixed(1)} MB`}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleVer(doc.conten_id)}>Ver</Button>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default ContenidosPage;
