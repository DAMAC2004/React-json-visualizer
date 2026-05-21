import { apiFetch } from './api';
import type { CapacitacionListItem } from '@/types/cognitaai';

export const listCapacitaciones = () =>
  apiFetch<{ items: CapacitacionListItem[]; total: number }>('/alumno/capacitaciones');

export const getCapacitacionDetalle = (capaci_id: string) =>
  apiFetch<unknown>(`/alumno/capacitaciones/${capaci_id}`);
