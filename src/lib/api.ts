const API_URL = import.meta.env.VITE_API_URL as string;

const TOKEN_KEY = 'cognitaai_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  status: number;
  codigo?: string;
  constructor(message: string, status: number, codigo?: string) {
    super(message);
    this.status = status;
    this.codigo = codigo;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw new ApiError('Sesión expirada', 401, 'UNAUTHORIZED');
  }

  if (res.status === 204) return null as T;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detalle: res.statusText }));
    throw new ApiError(err.detalle ?? err.message ?? 'Error desconocido', res.status, err.codigo);
  }

  return (await res.json()) as T;
}
