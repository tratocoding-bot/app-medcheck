import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Stethoscope, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function CadastroPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [perfil, setPerfil] = useState("concluinte");
  const [crm, setCrm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    // Update profile with perfil and crm
    if (data.user) {
      await supabase.from("profiles").update({
        full_name: fullName,
        perfil,
        crm: perfil === "medico" ? crm : null,
      }).eq("id", data.user.id);
    }
    setLoading(false);
    toast.success("Conta criada com sucesso!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">ENAMED Check</span>
          </div>
          <CardTitle className="text-xl">Criar Conta</CardTitle>
          <CardDescription>Cadastre-se para acompanhar seu progresso</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. João Silva" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" required />
            </div>

            <div className="space-y-3">
              <Label>Perfil</Label>
              <RadioGroup value={perfil} onValueChange={setPerfil} className="space-y-2">
                <div className="flex items-center space-x-2 p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="concluinte" id="concluinte" />
                  <Label htmlFor="concluinte" className="cursor-pointer flex-1">
                    <span className="font-medium">🎓 Concluinte 6º ano</span>
                    <p className="text-xs text-muted-foreground">Enade obrigatório, sem taxa</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="medico" id="medico" />
                  <Label htmlFor="medico" className="cursor-pointer flex-1">
                    <span className="font-medium">🩺 Médico formado</span>
                    <p className="text-xs text-muted-foreground">Acesso Direto ao ENARE</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="4ano" id="4ano" />
                  <Label htmlFor="4ano" className="cursor-pointer flex-1">
                    <span className="font-medium">📚 Estudante 4º ano</span>
                    <p className="text-xs text-muted-foreground">Novidade 2026 — nota vale 20% no ENARE</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {perfil === "medico" && (
              <div className="space-y-2">
                <Label htmlFor="crm">CRM (opcional)</Label>
                <Input id="crm" value={crm} onChange={(e) => setCrm(e.target.value)} placeholder="CRM/UF 12345" />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
