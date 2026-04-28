import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import CadastroPage from "@/pages/CadastroPage";
import DashboardPage from "@/pages/DashboardPage";
import ChecklistPage from "@/pages/ChecklistPage";
import AreaPraticaPage from "@/pages/AreaPraticaPage";
import CronogramaPage from "@/pages/CronogramaPage";
import PerfilPage from "@/pages/PerfilPage";
import AdminDatasPage from "@/pages/AdminDatasPage";
import AdminQuestoesPage from "@/pages/AdminQuestoesPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SimuladoPage from "@/pages/SimuladoPage";
import CadernosPage from "@/pages/CadernosPage";
import RankingPage from "@/pages/RankingPage";
import ChallengePage from "@/pages/ChallengePage";
import ReviewPage from "@/pages/ReviewPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/cadastro" element={<PublicRoute><CadastroPage /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/checklist" element={<ProtectedRoute><ChecklistPage /></ProtectedRoute>} />
            <Route path="/pratica/:area" element={<ProtectedRoute><AreaPraticaPage /></ProtectedRoute>} />
            <Route path="/cronograma" element={<ProtectedRoute><CronogramaPage /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
            <Route path="/simulado" element={<ProtectedRoute><SimuladoPage /></ProtectedRoute>} />
            <Route path="/cadernos" element={<ProtectedRoute><CadernosPage /></ProtectedRoute>} />
            <Route path="/ranking" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
            <Route path="/desafio" element={<ProtectedRoute><ChallengePage /></ProtectedRoute>} />
            <Route path="/revisao" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
            <Route path="/admin/datas" element={<ProtectedRoute><AdminRoute><AdminDatasPage /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/questoes" element={<ProtectedRoute><AdminRoute><AdminQuestoesPage /></AdminRoute></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
