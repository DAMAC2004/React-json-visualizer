import { apiFetch } from './api';
import type {
  ExamenListResponse, ExamenDetalle, IntentoActivo,
  AutosaveBody, AutosaveResponse, EntregarResponse,
} from '@/types/cognitaai';

export function listExamenes(params: { estado?: string; capaci_id?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.estado) qs.set('estado', params.estado);
  if (params.capaci_id) qs.set('capaci_id', params.capaci_id);
  const s = qs.toString() ? `?${qs}` : '';
  return apiFetch<ExamenListResponse>(`/alumno/examenes${s}`);
}

export const getExamenDetalle = (exam_id: string) =>
  apiFetch<ExamenDetalle>(`/alumno/examenes/${exam_id}`);

export const iniciarExamen = (exam_id: string) =>
  apiFetch<IntentoActivo>(`/alumno/examenes/${exam_id}/iniciar`, { method: 'POST' });

export const getIntentoEnProgreso = () =>
  apiFetch<IntentoActivo | null>('/alumno/intentos/en_progreso');

export const autosaveIntento = (intento_id: string, body: AutosaveBody) =>
  apiFetch<AutosaveResponse>(`/alumno/intentos/${intento_id}/autosave`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const entregarIntento = (intento_id: string, body: AutosaveBody) =>
  apiFetch<EntregarResponse>(`/alumno/intentos/${intento_id}/entregar`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
