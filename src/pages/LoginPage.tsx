import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, Sun, Moon, Users, TrendingUp, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // Simulated dynamic social proof
  const [userCount] = useState(() => 1200 + Math.floor(Math.random() * 130));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Digite seu e-mail primeiro");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("E-mail de recuperação enviado!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={() => setDarkMode(!darkMode)}
        title={darkMode ? "Modo claro" : "Modo escuro"}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">MedCheck Pro</span>
            </div>
            <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
            <CardDescription>Entre com sua conta para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <button onClick={handleResetPassword} className="text-sm text-primary hover:underline">
                Esqueci a senha
              </button>
              <p className="text-sm text-muted-foreground">
                Não tem conta?{" "}
                <Link to="/cadastro" className="text-primary hover:underline font-medium">
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <span>👨‍⚕️ <strong className="text-foreground">{userCount.toLocaleString("pt-BR")}</strong> médicos usando</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-success" />
            <span>📈 <strong className="text-foreground">87%</strong> melhoraram</span>
          </div>
        </div>
      </div>

      {/* WhatsApp floating button */}
      <WhatsAppButton />
    </div>
  );
}
