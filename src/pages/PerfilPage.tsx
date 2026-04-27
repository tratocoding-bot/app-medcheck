import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useUserStats } from "@/hooks/useUserStats";
import { getAllItems, checklistSections } from "@/data/checklistData";
import { getLevelForXP, getScoreLevel, calculateEnamedScore } from "@/data/clinicalQuestions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Save, Download, Trash2, KeyRound, Trophy, Flame } from "lucide-react";

export default function PerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { checkedCount, progress } = useChecklistProgress();
  const { stats } = useUserStats();
  const totalItems = getAllItems().length;
  const accuracy = (stats?.questions_answered ?? 0) > 0 ? (stats?.questions_correct ?? 0) / (stats?.questions_answered ?? 0) : 0;
  const enamedScore = calculateEnamedScore(accuracy, stats?.streak ?? 0, totalItems > 0 ? checkedCount / totalItems : 0);
  const scoreLevel = getScoreLevel(enamedScore);
  const level = getLevelForXP(stats?.xp ?? 0);
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [perfil, setPerfil] = useState(profile?.perfil ?? "concluinte");
  const [crm, setCrm] = useState(profile?.crm ?? "");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      perfil,
      crm: perfil === "medico" ? crm : null,
    }).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Perfil atualizado!");
      await refreshProfile();
    }
  };

  const handleExport = () => {
    const exportData = {
      user: { email: user?.email, name: profile?.full_name, perfil: profile?.perfil },
      progress: progress.filter((p) => p.checked).map((p) => ({ item_id: p.item_id, checked_at: p.checked_at })),
      summary: { total: totalItems, completed: checkedCount, percentage: totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0 },
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enamed-check-progresso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progresso exportado!");
  };

  const handleResetChecklist = async () => {
    if (!user) return;
    setResetting(true);
    const { error } = await supabase
      .from("checklist_progress")
      .delete()
      .eq("user_id", user.id);
    setResetting(false);
    if (error) {
      toast.error("Erro ao resetar: " + error.message);
    } else {
      toast.success("Checklist resetado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["checklist-progress", user.id] });
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("E-mail de redefinição de senha enviado!");
  };

  const completedSections = checklistSections.filter((section) => {
    const items = section.subsections.flatMap((sub) => sub.items);
    return items.length > 0 && items.every((item) => progress.find((p) => p.item_id === item.id)?.checked);
  }).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie seus dados pessoais</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled className="bg-secondary/30" />
          </div>
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="space-y-3">
            <Label>Perfil</Label>
            <RadioGroup value={perfil} onValueChange={setPerfil} className="space-y-2">
              <div className="flex items-center space-x-2 p-3 rounded-lg border bg-secondary/30">
                <RadioGroupItem value="concluinte" id="p-concluinte" />
                <Label htmlFor="p-concluinte" className="cursor-pointer">🎓 Concluinte 6º ano</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border bg-secondary/30">
                <RadioGroupItem value="medico" id="p-medico" />
                <Label htmlFor="p-medico" className="cursor-pointer">🩺 Médico formado</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border bg-secondary/30">
                <RadioGroupItem value="4ano" id="p-4ano" />
                <Label htmlFor="p-4ano" className="cursor-pointer">📚 Estudante 4º ano</Label>
              </div>
            </RadioGroup>
          </div>

          {perfil === "medico" && (
            <div className="space-y-2">
              <Label>CRM</Label>
              <Input value={crm} onChange={(e) => setCrm(e.target.value)} placeholder="CRM/UF 12345" />
            </div>
          )}

          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-2xl font-bold text-primary">{checkedCount}</p>
              <p className="text-xs text-muted-foreground">Itens concluídos</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-2xl font-bold text-success">{completedSections}</p>
              <p className="text-xs text-muted-foreground">Seções 100%</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-2xl font-bold text-accent">{enamedScore}</p>
              <p className="text-xs text-muted-foreground">ENAMED Score</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-warning" />
                <p className="text-2xl font-bold">{stats?.streak ?? 0}</p>
              </div>
              <p className="text-xs text-muted-foreground">Dias seguidos</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium flex items-center gap-1"><Trophy className="h-3 w-3 text-warning" /> {scoreLevel.label}</span>
              <span className="text-xs">{level.emoji} {level.label} — {stats?.xp ?? 0} XP</span>
            </div>
            <Progress value={enamedScore / 10} className="h-1.5" />
          </div>
          <p className="text-xs text-muted-foreground">
            Conta criada em: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "—"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar progresso
            </Button>
            <Button variant="outline" onClick={handleChangePassword}>
              <KeyRound className="mr-2 h-4 w-4" />
              Alterar senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-0 shadow-sm border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Esta ação apagará todo o seu progresso no checklist. Não pode ser desfeita.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={resetting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Resetar meu checklist
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso apagará permanentemente todo o seu progresso ({checkedCount} itens marcados).
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetChecklist} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sim, resetar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
