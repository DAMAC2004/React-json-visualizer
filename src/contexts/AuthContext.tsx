import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthState, LoginResponse } from '@/types/cognitaai';
import { mockLoginResponse } from '@/services/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('cognitaai_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return { isAuthenticated: false, user: null, token: null };
  });

  const login = useCallback(async (_email: string, _password: string): Promise<LoginResponse> => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    const response = mockLoginResponse;

    // Apply org branding
    if (response.esquema_color) {
      document.documentElement.style.setProperty('--org-primary', response.esquema_color.primary);
      document.documentElement.style.setProperty('--org-secondary', response.esquema_color.secondary);
    }

    const newState: AuthState = {
      isAuthenticated: true,
      user: response,
      token: response.token_sesion,
    };
    setState(newState);
    localStorage.setItem('cognitaai_auth', JSON.stringify(newState));
    return response;
  }, []);

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('cognitaai_auth');
    document.documentElement.style.removeProperty('--org-primary');
    document.documentElement.style.removeProperty('--org-secondary');
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
