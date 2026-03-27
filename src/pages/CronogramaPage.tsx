import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEnamedDates } from "@/hooks/useEnamedDates";
import { Clock, CheckCircle2, AlertTriangle, CircleDot, Info } from "lucide-react";
import { useEffect, useState } from "react";

const statusConfig: Record<string, { label: string; className: string }> = {
  done: { label: "Concluído", className: "bg-success/10 text-success border-success/30" },
  confirmed: { label: "Confirmado", className: "bg-success/10 text-success border-success/30" },
  pending: { label: "Previsto", className: "bg-accent/10 text-accent border-accent/30" },
  waiting: { label: "Aguardando", className: "bg-warning/10 text-warning border-warning/30" },
};

export default function CronogramaPage() {
  const { data: dates = [], isLoading } = useEnamedDates();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const hasOfficialDate = false;

  useEffect(() => {
    if (!hasOfficialDate) return;
    
    // Fallback if Date gets defined
    const examDate = new Date(2026, 8, 13, 8, 0, 0);
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, examDate.getTime() - now.getTime());
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [hasOfficialDate]);

  const getStatusIcon = (status: string | null, isCritical: boolean | null) => {
    if (status === "done") return <CheckCircle2 className="h-5 w-5 text-success" />;
    if (status === "waiting") return <AlertTriangle className="h-5 w-5 text-warning" />;
    if (isCritical) return <AlertTriangle className="h-5 w-5 text-primary" />;
    return <CircleDot className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Cronograma de Datas</h1>
        <p className="text-muted-foreground">Datas importantes do ENAMED 2026</p>
      </div>

      {/* Countdown card */}
      <Card className="border-0 shadow-md bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Data da Prova ENAMED 2026</span>
            </div>
            {hasOfficialDate ? (
              <div className="flex justify-center gap-4">
                {[
                  { value: countdown.days, label: "dias" },
                  { value: countdown.hours, label: "horas" },
                  { value: countdown.minutes, label: "min" },
                  { value: countdown.seconds, label: "seg" },
                ].map((unit) => (
                  <div key={unit.label} className="text-center">
                    <span className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{unit.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2">
                <span className="text-2xl font-bold text-primary block">Aguardando Data Pública</span>
                <p className="text-sm text-muted-foreground mt-2">O INEP ainda não divulgou o calendário oficial. Em breve atualizaremos sistema!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info alert */}
      <div className="flex items-start gap-2 p-3 rounded-lg border bg-accent/10 border-accent/30 text-accent text-sm">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>Datas marcadas com * são propostas no ofício SEI/INEP de dezembro/2025 e ainda aguardam confirmação oficial pelo INEP.</span>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-warning/10 text-warning border border-warning/30">🟡 Aguardando</Badge>
        <Badge className="bg-accent/10 text-accent border border-accent/30">🔵 Previsto</Badge>
        <Badge className="bg-success/10 text-success border border-success/30">✅ Confirmado</Badge>
        <Badge className="bg-success/10 text-success border border-success/30">✔️ Concluído</Badge>
      </div>

      {/* Timeline */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Timeline do ENAMED 2026</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {dates.map((date) => (
                  <div key={date.id} className="relative flex gap-4">
                    <div className="relative z-10 flex-shrink-0 mt-0.5">
                      {getStatusIcon(date.status, date.is_critical)}
                    </div>
                    <div className={`flex-1 p-3 rounded-lg ${date.is_critical ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium text-sm ${date.is_critical ? "text-primary" : ""}`}>
                            {date.event_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{date.event_date}</p>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {date.is_critical && <Badge className="bg-primary text-primary-foreground text-xs">ATENÇÃO</Badge>}
                          {date.status && statusConfig[date.status] && (
                            <Badge className={`text-xs border ${statusConfig[date.status].className}`}>
                              {statusConfig[date.status].label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
