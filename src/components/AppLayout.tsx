import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Stethoscope, LayoutDashboard, CheckSquare, Target, Calendar, User, Settings, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { getAllItems } from "@/data/checklistData";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/checklist", label: "Checklist", icon: CheckSquare },
  { to: "/aprovacao", label: "Aprovação Geral", icon: Target },
  { to: "/cronograma", label: "Cronograma", icon: Calendar },
  { to: "/perfil", label: "Perfil", icon: User },
];

function perfilLabel(perfil: string | null) {
  switch (perfil) {
    case "concluinte": return "🎓 Concluinte";
    case "medico": return "🩺 Médico";
    case "4ano": return "📚 4º Ano";
    default: return "";
  }
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { profile, isAdmin, signOut } = useAuth();
  const { checkedCount } = useChecklistProgress();
  const totalItems = getAllItems().length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="font-bold text-primary text-lg hidden sm:inline">ENAMED Check</span>
          </Link>

          <div className="flex-1 max-w-xs mx-4 hidden sm:block">
            <div className="flex items-center gap-2">
              <Progress value={progressPercent} className="h-2 flex-1" />
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{progressPercent}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile?.perfil && (
              <Badge variant="outline" className="hidden md:inline-flex text-xs">
                {perfilLabel(profile.perfil)}
              </Badge>
            )}
            <span className="text-sm font-medium hidden md:inline truncate max-w-[120px]">
              {profile?.full_name ?? "Usuário"}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Modo claro" : "Modo escuro"}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {/* Mobile progress */}
        <div className="sm:hidden px-4 pb-2">
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground">{progressPercent}%</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-56 flex-col border-r bg-card p-4 gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin/datas"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/admin/datas" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              Gerenciar Datas
            </Link>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          {children}

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground space-y-1 pb-4">
            <p>⚕ ENAMED 2026 — INEP / MEC / EBSERH</p>
            <p>Informações baseadas no Edital nº 81 (25/06/2025) e ofício SEI/INEP (dez/2025)</p>
            <p>
              Site oficial:{" "}
              <a href="https://enamed.inep.gov.br" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">enamed.inep.gov.br</a>
              {" | "}
              <a href="https://enare.ebserh.gov.br" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">enare.ebserh.gov.br</a>
            </p>
            <p className="text-[10px]">*Datas propostas sem confirmação oficial do INEP</p>
          </footer>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label.replace("Meu ", "")}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur pt-20 px-6" onClick={() => setMobileMenuOpen(false)}>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/datas"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Gerenciar Datas</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
