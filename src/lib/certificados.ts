import { apiFetch } from './api';
import type { CertificadoItem } from '@/types/cognitaai';

export const listCertificados = () =>
  apiFetch<{ total: number; items: CertificadoItem[] }>('/alumno/certificados');
