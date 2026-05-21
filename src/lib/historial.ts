import { apiFetch } from './api';
import type { HistorialItem, HistorialDetalle } from '@/types/cognitaai';

export function listHistorial(params: { estado?: string; capaci_id?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.estado) qs.set('estado', params.estado);
  if (params.capaci_id) qs.set('capaci_id', params.capaci_id);
  const s = qs.toString() ? `?${qs}` : '';
  return apiFetch<{ total: number; items: HistorialItem[] }>(`/alumno/historial${s}`);
}

export const getHistorialDetalle = (intento_id: string) =>
  apiFetch<HistorialDetalle>(`/alumno/historial/${intento_id}`);
