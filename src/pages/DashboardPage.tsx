import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useEnamedDates } from "@/hooks/useEnamedDates";
import { useAuth } from "@/contexts/AuthContext";
import { checklistSections, getAllItems } from "@/data/checklistData";
import { Calendar, BookOpen, FileText, MapPin, TrendingUp, Shield, Clock, AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";

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
  const allItems = getAllItems();
  const totalItems = allItems.length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  // Find next critical date
  const nextCritical = dates.find((d) => d.is_critical && d.status !== "done");

  // Calculate days to exam (Sep 13, 2026)
  const examDate = new Date(2026, 8, 13);
  const now = new Date();
  const daysToExam = Math.max(0, Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Olá, {profile?.full_name ?? "Candidato"}! Acompanhe seu progresso.</p>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Overall progress */}
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-32 h-32">
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
                <span className={`text-3xl font-bold ${getProgressColor(progressPercent)}`}>{progressPercent}%</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{checkedCount} de {totalItems} itens concluídos</p>
          </CardContent>
        </Card>

        {/* Countdown */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Contagem Regressiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{daysToExam}</span>
              <p className="text-sm text-muted-foreground mt-1">dias para a prova</p>
              <p className="text-xs text-muted-foreground mt-1">13 de setembro de 2026</p>
            </div>
            {nextCritical && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Próximo prazo crítico</p>
                    <p className="text-xs text-muted-foreground">{nextCritical.event_name} — {nextCritical.event_date}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile alert */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Alerta do seu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.perfil === "medico" && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium">🩺 Médico Formado</p>
                <p className="text-xs text-muted-foreground mt-1">Lembre-se: taxa de inscrição de R$330 via GRU. Verifique elegibilidade para ENARE.</p>
              </div>
            )}
            {profile?.perfil === "concluinte" && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium">🎓 Concluinte 6º Ano</p>
                <p className="text-xs text-muted-foreground mt-1">Sua IES deve fazer a inscrição no E-MEC/INEP. Confira se seu nome consta na lista.</p>
              </div>
            )}
            {profile?.perfil === "4ano" && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm font-medium">📚 Estudante 4º Ano</p>
                <p className="text-xs text-muted-foreground mt-1">Novidade 2026: sua nota valerá 20% na composição do ENARE. Taxa: R$330.</p>
              </div>
            )}
            {!profile?.perfil && (
              <p className="text-sm text-muted-foreground">Configure seu perfil para ver alertas personalizados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section cards */}
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
