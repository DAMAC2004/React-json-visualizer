import { apiFetch } from './api';
import type { ContenidoListResponse, ContenidoUrlResponse } from '@/types/cognitaai';

export const listContenidos = (capaci_id: string) =>
  apiFetch<ContenidoListResponse>(`/alumno/contenidos?capaci_id=${encodeURIComponent(capaci_id)}`);

export const getContenidoUrl = (conten_id: string) =>
  apiFetch<ContenidoUrlResponse>(`/alumno/contenidos/${conten_id}/url`);
