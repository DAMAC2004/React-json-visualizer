// ============ Tipos según contrato real de la API CognitaAI v1.5.0 ============

export type UsuarioTipo = 'alumno' | 'catedratico' | 'admin' | 'superadmin';
export type EstadoIntento = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'EXPIRADO';
export type Dificultad = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
export type EstadoInscripcion = 'pendiente' | 'en_progreso' | 'completado' | 'vencido';

export interface Usuario {
  usuario_id: string;
  usuario_tipo: UsuarioTipo;
  usuario_rol?: string;
  usuario_nombre: string;
  usuario_apellidos?: string;
  usuario_correo: string;
  usuario_idioma?: string;
  usuario_modo_oscuro?: boolean;
  avatar_url?: string | null;
}

export interface Organizacion {
  org_id: string;
  org_nombre: string;
  org_color_primario?: string | null;
  org_color_secundario?: string | null;
  org_logo_url?: string | null;
}

export interface LoginResponse {
  status?: string;
  access_token: string;
  token_type?: string;
  expires_in?: number;
  usuario: Usuario;
  organizacion: Organizacion;
}

export interface MeResponse {
  usuario: Usuario;
  organizacion: Organizacion;
}

export interface AuthState {
  isAuthenticated: boolean;
  usuario: Usuario | null;
  organizacion: Organizacion | null;
  token: string | null;
  loading: boolean;
}

// ============ Dashboard ============
export interface Metricas {
  promedio_actual: number;
  racha_dias: number;
  ultima_actividad?: string | null;
  capacitaciones_completadas: number;
  capacitaciones_total: number;
  examenes_aprobados: number;
  examenes_total: number;
  tasa_aprobacion?: number;
}

export interface CapacitacionDashboard {
  capaci_id: string;
  capaci_nombre: string;
  progreso: number;
  estado_inscripcion: EstadoInscripcion;
  catedraticos?: { nombre?: string }[];
}

export interface ExamenPendiente {
  exam_id: string;
  exam_nombre: string;
  exam_dificultad: Dificultad;
  intentos_realizados: number;
  estado_intento: EstadoIntento;
  total_preguntas: number;
  capaci_id?: string;
  capaci_nombre?: string;
  exam_tema?: string;
  exam_fecha_vencimiento?: string | null;
}

export interface IntentoEnProgresoRef {
  intento_id: string;
  exam_id: string;
  exam_nombre: string;
  capaci_nombre?: string;
  tiempo_restante_seg: number;
}

export interface DashboardResponse {
  saludo?: string;
  metricas: Metricas;
  intento_en_progreso: IntentoEnProgresoRef | null;
  capacitaciones: CapacitacionDashboard[];
  examenes_pendientes: ExamenPendiente[];
  contenidos_recientes?: unknown[];
}

// ============ Exámenes ============
export interface ExamenListItem {
  exam_id: string;
  capaci_id: string;
  capaci_nombre: string;
  exam_nombre: string;
  exam_dificultad: Dificultad;
  exam_tema?: string;
  exam_tiempo_limite: number;
  exam_intentos_max: number;
  intentos_realizados: number;
  mejor_calificacion: number | null;
  exam_fecha_vencimiento?: string | null;
  total_preguntas: number;
  estado_intento: EstadoIntento;
}

export interface ExamenListResponse {
  items: ExamenListItem[];
  total: number;
}

export interface ExamenDetalle {
  exam_id: string;
  exam_nombre: string;
  exam_dificultad: Dificultad;
  exam_tiempo_limite: number;
  exam_intentos_max: number;
  exam_calificacion_minima: number;
  intentos_realizados: number;
  intentos_disponibles: number;
  mejor_calificacion: number | null;
  total_preguntas: number;
  estado_intento: EstadoIntento;
}

// ============ Motor de Intento ============
export interface OpcionAPI {
  letra: string;
  texto: string;
  es_correcta?: boolean;
  explicacion?: string;
}

export interface PreguntaAPI {
  id_pregunta: string;
  enunciado: string;
  tipo_pregunta?: string;
  opciones: OpcionAPI[];
}

export interface ProgresoExamen {
  respuestas: Record<string, string>;
  marcadas: string[];
  tiempo_restante?: number;
  ultima_sync?: string;
}

export interface IntentoActivo {
  intento_id: string;
  exam_id: string;
  exam_nombre?: string;
  capaci_nombre?: string;
  numero_intento?: number;
  es_retoma?: boolean;
  fecha_inicio?: string;
  tiempo_limite_seg?: number;
  tiempo_restante_seg: number;
  preguntas: PreguntaAPI[];
  progreso_guardado: ProgresoExamen | null;
}

export interface AutosaveBody {
  respuestas: Record<string, string>;
  marcadas: string[];
}

export interface AutosaveResponse {
  intento_id: string;
  synced_at: string;
  tiempo_restante_seg: number;
}

export interface EntregarResponse {
  intento_id: string;
  inex_estado: string;
  fecha_fin?: string;
  resultados_disponibles_en?: string;
  mensaje?: string;
}

// ============ Capacitaciones ============
export interface CapacitacionListItem {
  capaci_id: string;
  capaci_nombre: string;
  capaci_descripcion?: string;
  capaci_fecha_inicio?: string;
  capaci_fecha_fin?: string;
  estado_inscripcion: EstadoInscripcion;
  progreso: number;
}

// ============ Contenidos ============
export interface ContenidoItem {
  conten_id: string;
  conten_nombre: string;
  conten_tipo: string;
  caco_unidad?: number;
  caco_orden?: number;
  conten_tamanio_kb?: number | null;
  visto?: boolean;
}

export interface ContenidoListResponse {
  capaci_id: string;
  total: number;
  items: ContenidoItem[];
}

export interface ContenidoUrlResponse {
  conten_id: string;
  conten_nombre: string;
  conten_tipo: string;
  url: string;
  expira_en: string | null;
}

// ============ Historial ============
export interface HistorialItem {
  intento_id: string;
  exam_nombre: string;
  capaci_nombre: string;
  inex_estado: 'COMPLETADO' | 'EXPIRADO';
  inex_fecha_inicio: string;
  inex_fecha_fin: string;
  calificacion: number | null;
  aciertos: number | null;
  total_preguntas: number;
  resultados_disponibles: boolean;
}

export interface HistorialFeedback {
  id_pregunta: string;
  enunciado: string;
  respuesta_alumno: string | null;
  respuesta_correcta: string;
  es_correcto: boolean;
  explicacion: string;
  opciones: OpcionAPI[];
}

export interface HistorialDetalle {
  intento_id: string;
  exam_nombre: string;
  resultados_disponibles: boolean;
  resultados_disponibles_en?: string | null;
  calificacion?: number | null;
  aciertos?: number | null;
  total_preguntas?: number;
  aprobado?: boolean;
  feedback?: HistorialFeedback[];
}

// ============ Métricas ============
export interface EvolucionPunto {
  periodo: string;
  promedio: number;
  examenes_presentados: number;
}

export interface MetricasResponse extends Metricas {
  evolucion_promedio?: EvolucionPunto[];
}

// ============ Certificados ============
export interface CertificadoItem {
  cert_id: string;
  cert_folio: string;
  exam_nombre: string;
  capaci_nombre: string;
  cert_emitido_en: string;
  cert_pdf_url: string | null;
  cert_qr_url: string | null;
}
