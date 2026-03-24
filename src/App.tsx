import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ExamenesPage from "./pages/ExamenesPage";
import ContenidosPage from "./pages/ContenidosPage";
import CapacitacionesPage from "./pages/CapacitacionesPage";
import HistorialPage from "./pages/HistorialPage";
import MetricasPage from "./pages/MetricasPage";
import ExamEngine from "./pages/ExamEngine";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="examenes" element={<ExamenesPage />} />
              <Route path="contenidos" element={<ContenidosPage />} />
              <Route path="historial" element={<HistorialPage />} />
              <Route path="metricas" element={<MetricasPage />} />
            </Route>
            <Route path="/examen/:id" element={<ExamEngine />} />
            <Route path="/resultados" element={<Results />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
