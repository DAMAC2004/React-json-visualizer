import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AuthState, LoginResponse, Usuario, Organizacion } from '@/types/cognitaai';
import { login as apiLogin, getMe, logout as apiLogout } from '@/lib/auth';
import { getToken } from '@/lib/api';
import { applyOrgBranding, resetOrgBranding } from '@/lib/color';

interface AuthContextType extends AuthState {
  login: (correo: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const initial: AuthState = {
  isAuthenticated: false,
  usuario: null,
  organizacion: null,
  token: null,
  loading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initial);

  const applyOrg = (org: Organizacion | null) => {
    if (org) applyOrgBranding(org.org_color_primario, org.org_color_secundario);
  };

  // Hydrate from token on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState({ ...initial, loading: false });
      return;
    }
    getMe()
      .then((me) => {
        applyOrg(me.organizacion);
        setState({
          isAuthenticated: true,
          usuario: me.usuario,
          organizacion: me.organizacion,
          token,
          loading: false,
        });
      })
      .catch(() => {
        setState({ ...initial, loading: false });
      });
  }, []);

  const login = useCallback(async (correo: string, password: string): Promise<LoginResponse> => {
    const res = await apiLogin(correo, password);
    applyOrg(res.organizacion);
    setState({
      isAuthenticated: true,
      usuario: res.usuario,
      organizacion: res.organizacion,
      token: res.access_token,
      loading: false,
    });
    return res;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    resetOrgBranding();
    setState({ ...initial, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

// Helper para obtener un usuario tipado garantizado (uso en páginas tras guard)
export function useUsuario(): Usuario {
  const { usuario } = useAuth();
  if (!usuario) throw new Error('Usuario no disponible');
  return usuario;
}
