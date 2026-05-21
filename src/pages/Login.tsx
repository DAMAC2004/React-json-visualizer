import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Brain, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('alumno_f2_01@primaria-bj.edu.mx');
  const [password, setPassword] = useState('Test1234');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 5000);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Credenciales incorrectas';
      setError(msg);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlow(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando sesión…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 org-gradient items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
            <Brain className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground">CognitaAI</h1>
          <p className="text-lg text-primary-foreground/80">
            Plataforma de capacitación organizacional impulsada por Inteligencia Artificial Generativa
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">CognitaAI</span>
          </div>

          <div>
            <h2 className="text-foreground">Iniciar Sesión</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Accede a tu plataforma de capacitación
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {slow && (
            <div className="p-3 rounded-lg bg-warning/10 text-warning text-sm">
              El servidor se está iniciando, esto puede tardar unos segundos…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando…
                </span>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-muted-foreground text-xs justify-center">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Plataforma de uso exclusivo organizacional</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
