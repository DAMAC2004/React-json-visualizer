import { apiFetch } from './api';

export const getPerfil = () => apiFetch<unknown>('/alumno/perfil');
