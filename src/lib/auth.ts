import { apiFetch, setToken, removeToken } from './api';
import type { LoginResponse, MeResponse } from '@/types/cognitaai';

export async function login(correo: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });
  if (data.access_token) setToken(data.access_token);
  return data;
}

export const getMe = () => apiFetch<MeResponse>('/auth/me');

export const logout = () => removeToken();
