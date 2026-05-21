import { apiFetch } from './api';
import type { DashboardResponse } from '@/types/cognitaai';

export const getDashboard = () => apiFetch<DashboardResponse>('/alumno/dashboard');
