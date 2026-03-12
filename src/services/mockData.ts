import type { LoginResponse, DashboardResponse, Pregunta, ExamenResultResponse, RespuestaDetalle } from '@/types/cognitaai';

export const mockLoginResponse: LoginResponse = {
  status: 'success',
  user_id: 450,
  tipo_usuario: 'Alumno',
  nombre: 'David May',
  id_organizacion: 10,
  nombre_organizacion: 'TecNM Región Sierra',
  perfil_alumno: {
    grupo: '8vo A',
    carrera: 'Ing. Informática',
    genero: 'Masculino',
  },
  token_sesion: 'mock-jwt-abc123xyz',
  esquema_color: {
    primary: '221 83% 53%',
    secondary: '142 71% 45%',
  },
  logo_url: undefined,
};

export const mockDashboardResponse: DashboardResponse = {
  capacitaciones: [
    {
      id_capacitacion: 5,
      id_usuario_capacitor: 100,
      nombre_capacitacion: 'Fundamentos de IA Generativa',
      descripcion: 'Curso introductorio sobre modelos de lenguaje y sus aplicaciones en la industria.',
      fecha_inicio_vigencia: '2026-01-15',
      fecha_fin_vigencia: '2026-04-15',
      estado: 'Activa',
      inscripcion: {
        id_inscripcion: 1,
        id_usuario: 450,
        id_capacitacion: 5,
        progreso_total: 65.5,
        estado_finalizacion: 'En curso',
      },
    },
    {
      id_capacitacion: 8,
      id_usuario_capacitor: 101,
      nombre_capacitacion: 'Seguridad en Redes Industriales',
      descripcion: 'Protocolos de seguridad para infraestructura crítica y redes SCADA.',
      fecha_inicio_vigencia: '2026-02-01',
      fecha_fin_vigencia: '2026-05-30',
      estado: 'Activa',
      inscripcion: {
        id_inscripcion: 2,
        id_usuario: 450,
        id_capacitacion: 8,
        progreso_total: 30.0,
        estado_finalizacion: 'En curso',
      },
    },
    {
      id_capacitacion: 12,
      id_usuario_capacitor: 102,
      nombre_capacitacion: 'Python para Análisis de Datos',
      descripcion: 'Manejo de Pandas, NumPy y visualización con Matplotlib.',
      fecha_inicio_vigencia: '2025-10-01',
      fecha_fin_vigencia: '2026-02-28',
      estado: 'Finalizada',
      inscripcion: {
        id_inscripcion: 3,
        id_usuario: 450,
        id_capacitacion: 12,
        progreso_total: 100,
        estado_finalizacion: 'Completado',
      },
    },
  ],
  examenes_pendientes: [
    {
      id_examen: 88,
      id_capacitacion: 5,
      titulo: 'Evaluación: Modelos de Lenguaje',
      nivel_dificultad: 'Media',
      tema: 'LLMs y Transformers',
      total_preguntas: 5,
      fecha_limite: '2026-03-14',
      estado_intento: 'PENDIENTE',
    },
    {
      id_examen: 92,
      id_capacitacion: 5,
      titulo: 'Evaluación: Prompt Engineering',
      nivel_dificultad: 'Alta',
      tema: 'Técnicas de Prompting',
      total_preguntas: 5,
      fecha_limite: '2026-03-20',
      estado_intento: 'PENDIENTE',
    },
    {
      id_examen: 95,
      id_capacitacion: 8,
      titulo: 'Evaluación: Protocolos SCADA',
      nivel_dificultad: 'Baja',
      tema: 'Seguridad Industrial',
      total_preguntas: 5,
      fecha_limite: '2026-04-01',
      estado_intento: 'EN_PROGRESO',
    },
  ],
  contenidos: [
    { id_contenido: 1, id_capacitacion: 5, titulo_documento: 'Introducción a los LLMs', categoria_tema: 'IA', tamaño_archivo_kb: 2400, es_descargable: true, visto: true },
    { id_contenido: 2, id_capacitacion: 5, titulo_documento: 'Arquitectura Transformer', categoria_tema: 'IA', tamaño_archivo_kb: 3100, es_descargable: true, visto: false },
    { id_contenido: 3, id_capacitacion: 8, titulo_documento: 'Manual de Seguridad SCADA', categoria_tema: 'Redes', tamaño_archivo_kb: 5200, es_descargable: false, visto: false },
  ],
  metricas: {
    promedio_actual: 85.5,
    capacitaciones_completadas: 1,
    capacitaciones_total: 3,
    examenes_aprobados: 4,
    examenes_total: 6,
    racha_dias: 7,
  },
};

export const mockPreguntas: Pregunta[] = [
  {
    id_pregunta: 1001,
    enunciado: '¿Cuál es la arquitectura base de los modelos GPT?',
    opcion_a: 'Redes Neuronales Recurrentes (RNN)',
    opcion_b: 'Transformer con atención multi-cabeza',
    opcion_c: 'Redes Convolucionales (CNN)',
    opcion_d: 'Máquinas de Boltzmann Restringidas',
    respuesta_correcta_clave: 'B',
    explicacion_ia: 'Los modelos GPT se basan en la arquitectura Transformer, específicamente en el componente decoder con mecanismos de atención multi-cabeza que permiten procesar secuencias de texto en paralelo.',
  },
  {
    id_pregunta: 1002,
    enunciado: '¿Qué técnica permite a un LLM generar respuestas más precisas sin reentrenamiento?',
    opcion_a: 'Transfer Learning',
    opcion_b: 'Data Augmentation',
    opcion_c: 'Prompt Engineering',
    opcion_d: 'Backpropagation',
    respuesta_correcta_clave: 'C',
    explicacion_ia: 'El Prompt Engineering permite diseñar instrucciones específicas que guían al modelo hacia respuestas más precisas sin necesidad de modificar sus pesos internos mediante reentrenamiento.',
  },
  {
    id_pregunta: 1003,
    enunciado: '¿Cuántos parámetros tiene aproximadamente el modelo GPT-4?',
    opcion_a: '175 mil millones',
    opcion_b: '1.8 billones (trillones en inglés)',
    opcion_c: '540 mil millones',
    opcion_d: 'No se ha revelado oficialmente',
    respuesta_correcta_clave: 'D',
    explicacion_ia: 'OpenAI no ha revelado oficialmente el número exacto de parámetros de GPT-4. A diferencia de GPT-3 (175B), la arquitectura exacta de GPT-4 permanece confidencial.',
  },
  {
    id_pregunta: 1004,
    enunciado: '¿Qué es el "tokenization" en el contexto de los LLMs?',
    opcion_a: 'El proceso de encriptar datos de usuario',
    opcion_b: 'La fragmentación del texto en unidades procesables por el modelo',
    opcion_c: 'La generación de tokens de autenticación JWT',
    opcion_d: 'El cálculo del costo por uso de la API',
    respuesta_correcta_clave: 'B',
    explicacion_ia: 'La tokenización es el proceso de dividir el texto en unidades más pequeñas (tokens) que el modelo puede procesar. Un token puede ser una palabra, parte de una palabra o incluso un carácter.',
  },
  {
    id_pregunta: 1005,
    enunciado: '¿Qué problema resuelve el mecanismo de "atención" en los Transformers?',
    opcion_a: 'La velocidad de entrenamiento en GPUs',
    opcion_b: 'La capacidad de relacionar palabras distantes en una secuencia',
    opcion_c: 'La reducción del tamaño del modelo',
    opcion_d: 'La generación de imágenes a partir de texto',
    respuesta_correcta_clave: 'B',
    explicacion_ia: 'El mecanismo de atención permite al modelo ponderar la relevancia de cada token respecto a los demás en la secuencia, resolviendo el problema de dependencias a larga distancia que afectaba a las RNN.',
  },
];

export function calculateResults(respuestas: RespuestaDetalle[], preguntas: Pregunta[]): ExamenResultResponse {
  let aciertos = 0;
  const detalle = preguntas.map((p) => {
    const r = respuestas.find((r) => r.id_pregunta === p.id_pregunta);
    const correcta = r?.opcion_elegida === p.respuesta_correcta_clave;
    if (correcta) aciertos++;
    return {
      id_pregunta: p.id_pregunta,
      correcta,
      respuesta_alumno: r?.opcion_elegida || '-',
      respuesta_correcta: p.respuesta_correcta_clave,
      explicacion_ia: p.explicacion_ia,
    };
  });

  const total = preguntas.length;
  const errores = total - aciertos;
  const calificacion = (aciertos / total) * 100;

  return {
    calificacion,
    aciertos,
    errores,
    total,
    porcentaje_aprobacion: calificacion,
    aprobado: calificacion >= 70,
    feedback_ia: calificacion >= 90
      ? '¡Excelente rendimiento! Dominas los conceptos fundamentales de esta unidad.'
      : calificacion >= 70
      ? 'Buen trabajo. Te recomiendo repasar los temas donde tuviste errores para consolidar tu conocimiento.'
      : 'Necesitas reforzar varios conceptos. Revisa el material de estudio y vuelve a intentarlo.',
    detalle,
  };
}
