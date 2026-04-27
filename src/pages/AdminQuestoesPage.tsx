import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const THEMES = [
  "Clínica Médica",
  "Cirurgia Geral",
  "Pediatria",
  "Ginecologia e Obstetrícia",
  "Medicina de Família e Comunidade",
  "Saúde Coletiva",
];

const DIFFICULTIES = [
  { value: "dificil", label: "Difícil (ENAMED/SUS padrão)", pct: 40 },
  { value: "muito_dificil", label: "Muito Difícil", pct: 40 },
  { value: "tubarao", label: "Tubarão (Residência top)", pct: 20 },
];

type Counts = Record<string, Record<string, number>>;

export default function AdminQuestoesPage() {
  const [theme, setTheme] = useState(THEMES[0]);
  const [difficulty, setDifficulty] = useState("dificil");
  const [count, setCount] = useState(5);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [total, setTotal] = useState(0);

  const loadCounts = async () => {
    const { data, error } = await supabase
      .from("clinical_questions")
      .select("theme, difficulty");
    if (error) return;
    const agg: Counts = {};
    let tot = 0;
    for (const row of data ?? []) {
      const t = row.theme as string;
      const d = (row.difficulty as string) || "dificil";
      if (!agg[t]) agg[t] = {};
      agg[t][d] = (agg[t][d] || 0) + 1;
      tot++;
    }
    setCounts(agg);
    setTotal(tot);
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const appendLog = (msg: string) => setLog((p) => [...p, msg]);

  const generateBatch = async (n: number) => {
    const { data, error } = await supabase.functions.invoke("generate-clinical-questions", {
      body: { theme, difficulty, count: n },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data?.inserted ?? 0;
  };

  const handleGenerate = async () => {
    setRunning(true);
    setProgress(0);
    setLog([]);
    const target = count;
    const perCall = 5; // máx por request para manter qualidade
    let done = 0;
    try {
      while (done < target) {
        const chunk = Math.min(perCall, target - done);
        appendLog(`Gerando ${chunk} questões (${theme} / ${difficulty})...`);
        const inserted = await generateBatch(chunk);
        done += inserted;
        setProgress(Math.round((done / target) * 100));
        appendLog(`✓ ${inserted} questão(ões) inseridas. Total: ${done}/${target}`);
        await loadCounts();
        if (inserted === 0) {
          appendLog("⚠ Nenhuma questão válida retornada, parando.");
          break;
        }
      }
      toast.success(`✨ ${done} questões geradas!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro";
      appendLog(`✗ ${msg}`);
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Gerador de Questões Clínicas</h1>
          <p className="text-muted-foreground">
            Geração via IA (gemini-2.5-pro) no padrão ENAMED/SUS
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banco atual</CardTitle>
          <CardDescription>
            Total: <span className="font-bold text-primary">{total}</span> questões
            {" • "}Meta sugerida: 1800 (300 por especialidade, curva 40/40/20)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {THEMES.map((t) => {
              const c = counts[t] || {};
              const totalT = (c.dificil || 0) + (c.muito_dificil || 0) + (c.tubarao || 0);
              return (
                <div key={t} className="p-4 rounded-lg border bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{t}</span>
                    <Badge variant={totalT >= 300 ? "default" : "secondary"}>
                      {totalT} / 300
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>D: {c.dificil || 0}</span>
                    <span>MD: {c.muito_dificil || 0}</span>
                    <span>T: {c.tubarao || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (totalT / 300) * 100)} className="h-1 mt-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Gerar lote
          </CardTitle>
          <CardDescription>
            A IA elabora casos clínicos longos com 5 alternativas, explicação de todas e baseados em protocolos SUS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Especialidade</Label>
              <Select value={theme} onValueChange={setTheme} disabled={running}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THEMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dificuldade</Label>
              <Select value={difficulty} onValueChange={setDifficulty} disabled={running}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label} ({d.pct}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade (1-50)</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                disabled={running}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={running} size="lg" className="w-full">
            {running ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando... {progress}%</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Gerar {count} questão(ões)</>
            )}
          </Button>

          {running && <Progress value={progress} />}

          {log.length > 0 && (
            <div className="rounded-lg bg-muted p-4 max-h-64 overflow-auto text-xs font-mono space-y-1">
              {log.map((l, i) => (
                <div key={i} className="flex items-start gap-2">
                  {l.startsWith("✓") ? <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" /> :
                   l.startsWith("✗") ? <AlertCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" /> :
                   <span className="w-3" />}
                  <span>{l}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
