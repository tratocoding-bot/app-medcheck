import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnamedDates } from "@/hooks/useEnamedDates";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Save, Settings } from "lucide-react";

export default function AdminDatasPage() {
  const { data: dates = [], isLoading } = useEnamedDates();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ event_name: "", event_date: "", status: "pending", is_critical: false });

  const handleAdd = async () => {
    if (!newEvent.event_name || !newEvent.event_date) {
      toast.error("Preencha nome e data do evento");
      return;
    }
    const maxOrder = dates.length > 0 ? Math.max(...dates.map((d) => d.display_order ?? 0)) : 0;
    const { error } = await supabase.from("enamed_dates").insert({
      event_name: newEvent.event_name,
      event_date: newEvent.event_date,
      status: newEvent.status,
      is_critical: newEvent.is_critical,
      display_order: maxOrder + 1,
    });
    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      toast.success("Data adicionada!");
      setNewEvent({ event_name: "", event_date: "", status: "pending", is_critical: false });
      queryClient.invalidateQueries({ queryKey: ["enamed-dates"] });
    }
  };

  const handleUpdate = async (id: string, updates: Record<string, unknown>) => {
    const { error } = await supabase.from("enamed_dates").update(updates).eq("id", id);
    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      toast.success("Atualizado!");
      queryClient.invalidateQueries({ queryKey: ["enamed-dates"] });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta data?")) return;
    const { error } = await supabase.from("enamed_dates").delete().eq("id", id);
    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      toast.success("Data excluída!");
      queryClient.invalidateQueries({ queryKey: ["enamed-dates"] });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" /> Gerenciar Datas
        </h1>
        <p className="text-muted-foreground">Área administrativa — Editar datas do ENAMED</p>
      </div>

      {/* Add new */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Evento</Label>
              <Input value={newEvent.event_name} onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })} placeholder="Nome do evento" />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input value={newEvent.event_date} onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })} placeholder="Ex: ~Jul 2026 ou 13/09/2026" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newEvent.status} onValueChange={(v) => setNewEvent({ ...newEvent, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Previsto</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={newEvent.is_critical} onCheckedChange={(v) => setNewEvent({ ...newEvent, is_critical: v })} />
              <Label>Crítico</Label>
            </div>
          </div>
          <Button className="mt-4" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </CardContent>
      </Card>

      {/* Existing dates */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Datas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <div className="space-y-3">
              {dates.map((date) => (
                <div key={date.id} className="p-4 rounded-lg border bg-secondary/20 space-y-3">
                  {editingId === date.id ? (
                    <EditRow date={date} onSave={(updates) => { handleUpdate(date.id, updates); setEditingId(null); }} onCancel={() => setEditingId(null)} />
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">{date.event_name}</p>
                        <p className="text-xs text-muted-foreground">{date.event_date} · {date.status} {date.is_critical ? "· 🔴 Crítico" : ""}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(date.id)}>Editar</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(date.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EditRow({ date, onSave, onCancel }: { date: any; onSave: (u: Record<string, unknown>) => void; onCancel: () => void }) {
  const [name, setName] = useState(date.event_name);
  const [eventDate, setEventDate] = useState(date.event_date);
  const [status, setStatus] = useState(date.status ?? "pending");
  const [isCritical, setIsCritical] = useState(date.is_critical ?? false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Evento" />
      <Input value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Data" />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Previsto</SelectItem>
          <SelectItem value="confirmed">Confirmado</SelectItem>
          <SelectItem value="waiting">Aguardando</SelectItem>
          <SelectItem value="done">Concluído</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Switch checked={isCritical} onCheckedChange={setIsCritical} />
        <Label>Crítico</Label>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" onClick={() => onSave({ event_name: name, event_date: eventDate, status, is_critical: isCritical })}>
          <Save className="mr-1 h-3 w-3" /> Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}
