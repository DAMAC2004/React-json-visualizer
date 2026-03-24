import { mockDashboardResponse } from '@/services/mockData';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Users, Calendar, Clock, FileText,
  ClipboardList, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CapacitacionesPage = () => {
  const navigate = useNavigate();
  const { capacitaciones, examenes_pendientes, contenidos } = mockDashboardResponse;

  const activas = capacitaciones.filter(c => c.estado === 'Activa');
  const finalizadas = capacitaciones.filter(c => c.estado === 'Finalizada');

  const getExamenesForCap = (idCap: number) =>
    examenes_pendientes.filter(e => e.id_capacitacion === idCap);

  const getContenidosForCap = (idCap: number) =>
    contenidos.filter(c => c.id_capacitacion === idCap);

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1>Mis Capacitaciones</h1>
        <p className="text-muted-foreground mt-1">
          {capacitaciones.length} capacitaciones inscritas · {activas.length} activas
        </p>
      </div>

      <Tabs defaultValue="activas">
        <TabsList>
          <TabsTrigger value="activas">Activas ({activas.length})</TabsTrigger>
          <TabsTrigger value="finalizadas">Finalizadas ({finalizadas.length})</TabsTrigger>
          <TabsTrigger value="todas">Todas ({capacitaciones.length})</TabsTrigger>
        </TabsList>

        {(['activas', 'finalizadas', 'todas'] as const).map(tab => {
          const list = tab === 'activas' ? activas : tab === 'finalizadas' ? finalizadas : capacitaciones;
          return (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
              {list.map(cap => {
                const examenes = getExamenesForCap(cap.id_capacitacion);
                const docs = getContenidosForCap(cap.id_capacitacion);
                const daysLeft = getDaysLeft(cap.fecha_fin_vigencia);
                const isCompleted = cap.inscripcion.estado_finalizacion === 'Completado';
                const isExpiring = daysLeft <= 14 && daysLeft > 0 && !isCompleted;

                return (
                  <Card key={cap.id_capacitacion} className="card-shadow overflow-hidden">
                    {/* Header band */}
                    <div className={cn(
                      "h-2",
                      isCompleted ? "bg-success" : isExpiring ? "bg-warning" : "org-gradient"
                    )} />

                    <div className="p-5 space-y-4">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground leading-snug">
                              {cap.nombre_capacitacion}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {cap.descripcion}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge
                            variant={isCompleted ? 'default' : 'secondary'}
                            className={cn(
                              "text-xs",
                              isCompleted && "bg-success text-success-foreground"
                            )}
                          >
                            {cap.inscripcion.estado_finalizacion}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {cap.estado}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progreso general</span>
                          <span className="tabular-nums font-medium text-foreground">
                            {cap.inscripcion.progreso_total}%
                          </span>
                        </div>
                        <Progress value={cap.inscripcion.progreso_total} className="h-2" />
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(cap.fecha_inicio_vigencia).toLocaleDateString('es-MX')} – {new Date(cap.fecha_fin_vigencia).toLocaleDateString('es-MX')}
                        </span>
                        {!isCompleted && (
                          <span className={cn(
                            "flex items-center gap-1",
                            isExpiring && "text-warning font-medium"
                          )}>
                            <Clock className="w-3.5 h-3.5" />
                            {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vigencia vencida'}
                          </span>
                        )}
                      </div>

                      {/* Quick stats */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Exámenes */}
                        <div className="rounded-lg border border-border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                              <ClipboardList className="w-3.5 h-3.5 text-primary" />
                              Exámenes
                            </span>
                            <Badge variant="secondary" className="text-xs tabular-nums">
                              {examenes.length}
                            </Badge>
                          </div>
                          {examenes.length > 0 ? (
                            <div className="space-y-1">
                              {examenes.slice(0, 2).map(ex => (
                                <button
                                  key={ex.id_examen}
                                  onClick={() => navigate(`/examen/${ex.id_examen}`)}
                                  className="flex items-center gap-2 w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {ex.estado_intento === 'EN_PROGRESO' ? (
                                    <AlertCircle className="w-3 h-3 text-warning shrink-0" />
                                  ) : (
                                    <ClipboardList className="w-3 h-3 shrink-0" />
                                  )}
                                  <span className="truncate">{ex.titulo}</span>
                                </button>
                              ))}
                              {examenes.length > 2 && (
                                <p className="text-xs text-muted-foreground">+{examenes.length - 2} más</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Sin exámenes pendientes</p>
                          )}
                        </div>

                        {/* Contenidos */}
                        <div className="rounded-lg border border-border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-primary" />
                              Contenidos
                            </span>
                            <Badge variant="secondary" className="text-xs tabular-nums">
                              {docs.length}
                            </Badge>
                          </div>
                          {docs.length > 0 ? (
                            <div className="space-y-1">
                              {docs.slice(0, 2).map(doc => (
                                <div key={doc.id_contenido} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {doc.visto ? (
                                    <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                                  ) : (
                                    <FileText className="w-3 h-3 shrink-0" />
                                  )}
                                  <span className="truncate">{doc.titulo_documento}</span>
                                </div>
                              ))}
                              {docs.length > 2 && (
                                <p className="text-xs text-muted-foreground">+{docs.length - 2} más</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Sin materiales</p>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      {!isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate('/dashboard/examenes')}
                        >
                          Continuar capacitación
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}

              {list.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No hay capacitaciones en esta categoría</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default CapacitacionesPage;
