// ============ DIM_USUARIOS ============
export interface Usuario {
  id_usuario: number;
  correo_electronico: string;
  username: string;
  nombre_completo: string;
  tipo_usuario: 'Alumno' | 'Capacitor' | 'Administrador' | 'Superadmin';
  id_organizacion: number | null;
  fecha_registro: string;
  activo: boolean;
}

// ============ DIM_PERFIL_ALUMNOS ============
export interface PerfilAlumno {
  id_usuario: number;
  grupo: string;
  carrera_departamento: string;
  genero: string;
  nivel_academico: string;
}

// ============ DIM_ORGANIZACIONES ============
export interface Organizacion {
  id_organizacion: number;
  nombre_organizacion: string;
  region: string;
  tipo: string;
  esquema_color_asignado?: {
    primary: string; // HSL string e.g. "221 83% 53%"
    secondary: string;
  };
  logo_url?: string;
}

// ============ DIM_CAPACITACIONES ============
export interface Capacitacion {
  id_capacitacion: number;
  id_usuario_capacitor: number;
  nombre_capacitacion: string;
  descripcion: string;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string;
  estado: 'Activa' | 'Pausada' | 'Finalizada';
}

// ============ DIM_EXAMENES ============
export interface Examen {
  id_examen: number;
  id_capacitacion: number;
  titulo: string;
  nivel_dificultad: 'Baja' | 'Media' | 'Alta';
  tema: string;
  total_preguntas?: number;
  fecha_limite?: string;
  estado_intento?: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO';
}

// ============ DIM_PREGUNTAS ============
export interface Pregunta {
  id_pregunta: number;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  respuesta_correcta_clave: 'A' | 'B' | 'C' | 'D';
  explicacion_ia: string;
  svg_content?: string;
}

// ============ DIM_CONTENIDOS_PDF ============
export interface ContenidoPDF {
  id_contenido: number;
  id_capacitacion: number;
  titulo_documento: string;
  categoria_tema: string;
  tamaño_archivo_kb: number;
  es_descargable: boolean;
  url_s3?: string;
  visto?: boolean;
}

// ============ FACT_INSCRIPCIONES ============
export interface Inscripcion {
  id_inscripcion: number;
  id_usuario: number;
  id_capacitacion: number;
  progreso_total: number;
  estado_finalizacion: 'En curso' | 'Completado' | 'Vencido';
}

// ============ API Responses ============
export interface LoginResponse {
  status: 'success' | 'error';
  user_id: number;
  tipo_usuario: string;
  nombre: string;
  id_organizacion: number;
  nombre_organizacion: string;
  perfil_alumno: {
    grupo: string;
    carrera: string;
    genero: string;
  };
  token_sesion: string;
  esquema_color?: {
    primary: string;
    secondary: string;
  };
  logo_url?: string;
}

export interface DashboardResponse {
  capacitaciones: (Capacitacion & { inscripcion: Inscripcion })[];
  examenes_pendientes: Examen[];
  contenidos: ContenidoPDF[];
  metricas: {
    promedio_actual: number;
    capacitaciones_completadas: number;
    capacitaciones_total: number;
    examenes_aprobados: number;
    examenes_total: number;
    racha_dias: number;
  };
}

export interface RespuestaDetalle {
  id_pregunta: number;
  opcion_elegida: string | null;
  tiempo_segundos: number;
  duda: boolean;
}

export interface ExamenSubmitRequest {
  id_usuario: number;
  id_examen: number;
  id_capacitacion: number;
  tiempo_total_segundos: number;
  dispositivo: string;
  respuestas_detalle: RespuestaDetalle[];
}

export interface ExamenResultResponse {
  calificacion: number;
  aciertos: number;
  errores: number;
  total: number;
  porcentaje_aprobacion: number;
  aprobado: boolean;
  feedback_ia: string;
  detalle: {
    id_pregunta: number;
    correcta: boolean;
    respuesta_alumno: string;
    respuesta_correcta: string;
    explicacion_ia: string;
  }[];
}

// ============ Auth State ============
export interface AuthState {
  isAuthenticated: boolean;
  user: LoginResponse | null;
  token: string | null;
}
