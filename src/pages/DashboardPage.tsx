import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useEnamedDates } from "@/hooks/useEnamedDates";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats, useWeakPoints } from "@/hooks/useUserStats";
import { checklistSections, getAllItems } from "@/data/checklistData";
import { themeInfo, getScoreLevel, calculateEnamedScore } from "@/data/clinicalQuestions";
import { Calendar, BookOpen, FileText, MapPin, TrendingUp, Shield, Clock, AlertTriangle, CheckCircle2, ClipboardList, Brain, Target, Flame, Trophy, Zap, Layers, BrainCircuit } from "lucide-react";
import { useMemo } from "react";

const sectionIcons: Record<string, React.ElementType> = {
  Calendar, FileText, BookOpen, MapPin, TrendingUp, Shield, ClipboardList,
};

function getProgressColor(pct: number) {
  if (pct >= 70) return "text-success";
  if (pct >= 40) return "text-warning";
  return "text-primary";
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const { isChecked, checkedCount, recentItems } = useChecklistProgress();
  const { data: dates = [] } = useEnamedDates();
  const { stats } = useUserStats();
  const weakPoints = useWeakPoints();
  const allItems = getAllItems();
  const totalItems = allItems.length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const nextCritical = dates.find((d) => d.is_critical && d.status !== "done");

  const now = new Date();
  
  // Como não há data oficial para 2026 ainda, definimos dias para exame apenas visualmente como pendente
  const hasOfficialDate = false;
  const daysToExam = 0;

  // ENAMED Score
  const accuracy = (stats?.questions_answered ?? 0) > 0
    ? (stats?.questions_correct ?? 0) / (stats?.questions_answered ?? 0)
    : 0;
  const enamedScore = calculateEnamedScore(
    accuracy,
    stats?.streak ?? 0,
    totalItems > 0 ? checkedCount / totalItems : 0
  );
  const scoreLevel = getScoreLevel(enamedScore);

  // Daily task generation
  const dailyTask = useMemo(() => {
    const tasks = [];
    if (weakPoints.length > 0) {
      const top = weakPoints[0];
      tasks.push(`Revise ${themeInfo[top.theme]?.label ?? top.theme} + responda 5 questões`);
    }
    const incompleteSections = checklistSections.filter(s => {
      const items = s.subsections.flatMap(sub => sub.items);
      const checked = items.filter(i => isChecked(i.id)).length;
      return checked < items.length;
    });
    if (incompleteSections.length > 0) {
      tasks.push(`Finalize checklist de "${incompleteSections[0].title}"`);
    }
    if ((stats?.questions_answered ?? 0) < 5) {
      tasks.push("Responda suas primeiras 5 questões clínicas");
    }
    return tasks[0] ?? "Continue seu progresso — cada item conta!";
  }, [weakPoints, stats, isChecked]);

  // Performance alert
  const performanceAlert = useMemo(() => {
    if (hasOfficialDate && daysToExam < 180 && progressPercent < 30) return "Você está atrasado no cronograma. Intensifique seus estudos!";
    if (hasOfficialDate && daysToExam < 90 && progressPercent < 60) return "Seu ritmo atual pode não ser suficiente para aprovação.";
    if ((stats?.streak ?? 0) === 0 && (stats?.questions_answered ?? 0) > 0) return "Você perdeu sua sequência. Retome hoje!";
    return null;
  }, [daysToExam, progressPercent, stats, hasOfficialDate]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Olá, {profile?.full_name ?? "Candidato"}! Acompanhe seu progresso.</p>
      </div>

      {/* Performance alert */}
      {performanceAlert && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm font-medium text-destructive">{performanceAlert}</p>
        </div>
      )}

      {/* Daily Challenge Banner */}
      <Link to="/desafio" className="block mt-2">
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg flex items-center justify-between group hover:shadow-xl transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Desafio do Dia <Badge variant="secondary" className="bg-white text-red-600 border-none font-black text-[10px] uppercase">Loot</Badge>
              </h2>
              <p className="text-sm opacity-90 font-medium">1 Pergunta. 1 Chance de XP extra. Acaba à meia-noite.</p>
            </div>
          </div>
          <Button variant="secondary" type="button" className="hidden sm:flex bg-white text-red-600 hover:bg-slate-50 border-none pointer-events-none">
            Resolver Agora
          </Button>
        </div>
      </Link>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress */}
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
                <circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                  className={`${progressPercent >= 70 ? "stroke-success" : progressPercent >= 40 ? "stroke-warning" : "stroke-primary"} transition-all duration-1000`}
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 2.64} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${getProgressColor(progressPercent)}`}>{progressPercent}%</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{checkedCount}/{totalItems} itens</p>
          </CardContent>
        </Card>

        {/* Countdown */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Data da Prova
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center pt-2">
              <span className="text-sm font-bold text-muted-foreground">Sem data pública ainda</span>
              <p className="text-[10px] text-primary mt-1">Em breve atualiza</p>
            </div>
          </CardContent>
        </Card>

        {/* ENAMED Score */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" /> ENAMED Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <span className="text-3xl font-bold text-accent">{enamedScore}</span>
              <span className="text-sm text-muted-foreground">/1000</span>
              <p className="text-xs text-muted-foreground mt-1">{scoreLevel.label}</p>
            </div>
            <Progress value={enamedScore / 10} className="h-1.5 mt-2" />
            <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-warning" />{stats?.streak ?? 0}d</span>
              <span>{Math.round(accuracy * 100)}% acertos</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile alert */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Alerta do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.perfil === "medico" && (
              <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-xs font-medium">🩺 Médico Formado</p>
                <p className="text-[11px] text-muted-foreground mt-1">Taxa de inscrição ENARE: R$330 via GRU.</p>
              </div>
            )}
            {profile?.perfil === "concluinte" && (
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-xs font-medium">🎓 Concluinte 6º Ano</p>
                <p className="text-[11px] text-muted-foreground mt-1">Verifique se sua IES fez a inscrição.</p>
              </div>
            )}
            {profile?.perfil === "4ano" && (
              <div className="p-2 rounded-lg bg-success/10 border border-success/20">
                <p className="text-xs font-medium">📚 Estudante 4º Ano</p>
                <p className="text-[11px] text-muted-foreground mt-1">Nota vale 20% no ENARE.</p>
              </div>
            )}
            {!profile?.perfil && (
              <p className="text-xs text-muted-foreground">Configure seu perfil para alertas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Smart blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weak points */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-destructive" /> Seus pontos fracos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakPoints.length === 0 ? (
              <p className="text-xs text-muted-foreground">Responda questões em <strong>Aprovação</strong> para identificar seus pontos fracos.</p>
            ) : (
              weakPoints.slice(0, 3).map(wp => (
                <div key={wp.theme} className="flex items-center justify-between p-2 rounded bg-destructive/5">
                  <span className="text-sm">{themeInfo[wp.theme]?.icon} {themeInfo[wp.theme]?.label}</span>
                  <Badge variant="destructive" className="text-xs">{Math.round(wp.errorRate * 100)}%</Badge>
                </div>
              ))
            )}
            {weakPoints.length > 0 && (
              <Link to="/cadernos" state={{ onlyErrors: true }}>
                <Button variant="outline" size="sm" className="w-full mt-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/40 dark:hover:bg-rose-900/20">
                  <Target className="mr-2 h-3 w-3" /> Gerar Caderno de Erros
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Spaced Repetition (Anki Model) */}
        <Card className="border-0 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-500" /> Revisão Espaçada
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 dark:bg-sky-900/20 dark:border-sky-800/50">
              <p className="text-sm text-sky-900 dark:text-sky-300 font-medium mb-3">
                Sua pilha de Ebbinghaus tem flashcards baseados nos seus erros antigos.
              </p>
              <Link to="/revisao">
                <Button variant="default" size="sm" className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                  <BrainCircuit className="w-3 h-3 mr-2" /> Revisar Meu Deck
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Next step */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Próximo passo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                {(stats?.questions_answered ?? 0) === 0
                  ? "Comece respondendo questões clínicas em Aprovação"
                  : weakPoints.length > 0
                    ? `Refaça questões de ${themeInfo[weakPoints[0].theme]?.label}`
                    : "Continue marcando itens no checklist"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section progress */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Progresso por Seção</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {checklistSections.map((section) => {
            const sectionItems = section.subsections.flatMap((sub) => sub.items);
            const sectionChecked = sectionItems.filter((item) => isChecked(item.id)).length;
            const sectionTotal = sectionItems.length;
            const sectionPct = sectionTotal > 0 ? Math.round((sectionChecked / sectionTotal) * 100) : 0;
            const Icon = sectionIcons[section.icon] || CheckCircle2;

            return (
              <Link key={section.id} to={`/checklist?section=${section.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{section.title}</p>
                        <p className="text-xs text-muted-foreground">{sectionChecked}/{sectionTotal} itens</p>
                      </div>
                      <Badge variant={sectionPct === 100 ? "default" : "outline"} className={`text-xs ${sectionPct === 100 ? "bg-success" : ""}`}>
                        {sectionPct}%
                      </Badge>
                    </div>
                    <Progress value={sectionPct} className="h-1.5" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      {recentItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Atividade Recente</h2>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {recentItems.map((item) => {
                  const itemData = allItems.find((i) => i.id === item.item_id);
                  return (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="flex-1 truncate">{itemData?.text ?? item.item_id}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.checked_at ? new Date(item.checked_at).toLocaleDateString("pt-BR") : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
