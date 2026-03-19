import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEnamedDates } from "@/hooks/useEnamedDates";
import { Clock, CheckCircle2, AlertTriangle, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";

export default function CronogramaPage() {
  const { data: dates = [], isLoading } = useEnamedDates();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
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
  }, []);

  const getStatusIcon = (status: string | null, isCritical: boolean | null) => {
    if (status === "done") return <CheckCircle2 className="h-5 w-5 text-success" />;
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
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Contagem Regressiva — Dia da Prova</span>
            </div>
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
            <p className="text-sm text-muted-foreground mt-3">13 de setembro de 2026</p>
          </div>
        </CardContent>
      </Card>

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
                {dates.map((date, idx) => (
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
                        <div className="flex gap-1">
                          {date.is_critical && <Badge className="bg-primary text-primary-foreground text-xs">ATENÇÃO</Badge>}
                          {date.status === "done" && <Badge className="bg-success text-success-foreground text-xs">Concluído</Badge>}
                          {date.status === "confirmed" && <Badge variant="outline" className="text-xs">Confirmado</Badge>}
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
