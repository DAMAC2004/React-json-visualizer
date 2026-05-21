import { apiFetch } from './api';
import type { MetricasResponse } from '@/types/cognitaai';

export const getMetricas = () => apiFetch<MetricasResponse>('/alumno/metricas');
