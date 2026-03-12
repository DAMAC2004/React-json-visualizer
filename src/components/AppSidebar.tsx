import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, FileText, ClipboardList, BarChart3, 
  BookOpen, LogOut, Brain, ChevronLeft, Menu 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { path: '/dashboard/examenes', label: 'Exámenes', icon: ClipboardList },
  { path: '/dashboard/contenidos', label: 'Contenidos', icon: BookOpen },
  { path: '/dashboard/historial', label: 'Historial', icon: FileText },
  { path: '/dashboard/metricas', label: 'Métricas', icon: BarChart3 },
];

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <Brain className="w-6 h-6 text-primary shrink-0" />
        {!collapsed && <span className="font-semibold text-foreground truncate">CognitaAI</span>}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto hidden lg:flex h-7 w-7"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border px-3 py-3 shrink-0">
        {!collapsed && user && (
          <div className="mb-2 px-1">
            <p className="text-sm font-medium text-foreground truncate">{user.nombre}</p>
            <p className="text-xs text-muted-foreground truncate">{user.nombre_organizacion}</p>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Cerrar sesión'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-3 left-3 z-50 h-9 w-9 bg-card card-shadow"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-foreground/20 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static z-40 h-screen bg-card border-r border-border transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[240px]",
        mobileOpen ? "left-0" : "-left-[240px] lg:left-0"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default AppSidebar;
