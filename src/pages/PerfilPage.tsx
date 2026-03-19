import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { getAllItems } from "@/data/checklistData";
import { toast } from "sonner";
import { User, Save, Download } from "lucide-react";

export default function PerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { checkedCount, progress } = useChecklistProgress();
  const totalItems = getAllItems().length;

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [perfil, setPerfil] = useState(profile?.perfil ?? "concluinte");
  const [crm, setCrm] = useState(profile?.crm ?? "");
  const [saving, setSaving] = useState(false);

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
          <CardTitle className="text-base">Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {checkedCount} de {totalItems} itens concluídos ({totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0}%)
          </p>
          <p className="text-xs text-muted-foreground">
            Conta criada em: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "—"}
          </p>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar progresso (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
