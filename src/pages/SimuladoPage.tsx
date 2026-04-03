import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSimuladoQuestions, useSimuladoSession, useSimuladoRanking, useSimuladoHistory } from "@/hooks/useSimulado";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, XCircle, Trophy, Clock, Target, ArrowRight, Medal, Crown, Flame, Shield, Skull, Zap, BarChart3, Users } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const levels = [
  { level: 1, name: "Fácil", emoji: "🎯", description: "Não se engane pelo nome. Nível ENAMED real.", color: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { level: 2, name: "Médio", emoji: "⚡", description: "Casos integrados que exigem raciocínio clínico.", color: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10 border-blue-500/30" },
  { level: 3, name: "Difícil", emoji: "🔥", description: "Cenários complexos com armadilhas diagnósticas.", color: "from-orange-500 to-red-600", bg: "bg-orange-500/10 border-orange-500/30" },
  { level: 4, name: "Muito Difícil", emoji: "💀", description: "Apenas os mais preparados acertam.", color: "from-purple-500 to-pink-600", bg: "bg-purple-500/10 border-purple-500/30" },
  { level: 5, name: "Tubarão", emoji: "🦈", description: "Nível impossível. Prove que você é o melhor.", color: "from-red-600 to-rose-800", bg: "bg-red-600/10 border-red-600/30" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getRankIcon(position: number) {
  if (position === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (position === 1) return <Medal className="h-5 w-5 text-gray-400" />;
  if (position === 2) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{position + 1}</span>;
}

export default function SimuladoPage() {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ correct_option: number; explanation: string | null } | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [rankingLevel, setRankingLevel] = useState(1);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const { data: questions = [], isLoading: questionsLoading } = useSimuladoQuestions(selectedLevel ?? 0);
  const { createSession, submitAnswer, completeSession } = useSimuladoSession();
  const { data: ranking = [] } = useSimuladoRanking(rankingLevel);
  const { data: history = [] } = useSimuladoHistory();

  // Timer
  useEffect(() => {
    if (activeSession && !isFinished) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [activeSession, isFinished]);

  const handleStartSimulado = async (level: number) => {
    try {
      const session = await createSession.mutateAsync(level);
      setSelectedLevel(level);
      setActiveSession(session.id);
      setCurrentIndex(0);
      setSelectedOption(null);
      setShowResult(false);
      setAnswerResult(null);
      setSessionCorrect(0);
      setSessionTotal(0);
      setElapsedTime(0);
      setIsFinished(false);
    } catch {
      toast.error("Erro ao iniciar simulado");
    }
  };

  const handleAnswer = async (optionIndex: number) => {
    if (showResult || !activeSession || !questions[currentIndex]) return;
    setSelectedOption(optionIndex);
    setShowResult(true);

    try {
      const result = await submitAnswer.mutateAsync({
        sessionId: activeSession,
        questionId: questions[currentIndex].id,
        selectedOption: optionIndex,
      });
      setAnswerResult({ correct_option: result.correct_option, explanation: result.explanation });
      setSessionTotal(prev => prev + 1);
      if (result.is_correct) {
        setSessionCorrect(prev => prev + 1);
      }
    } catch {
      toast.error("Erro ao enviar resposta");
      setShowResult(false);
      setSelectedOption(null);
    }
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      handleFinish();
      return;
    }
    setSelectedOption(null);
    setShowResult(false);
    setAnswerResult(null);
    setCurrentIndex(prev => prev + 1);
  };

  const handleFinish = async () => {
    if (!activeSession) return;
    clearInterval(timerRef.current);
    setIsFinished(true);
    try {
      await completeSession.mutateAsync({ sessionId: activeSession, timeSeconds: elapsedTime });
      const pct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
      if (pct >= 70) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        toast.success(`🎉 Parabéns! ${pct}% de acerto!`);
      } else {
        toast("Simulado finalizado. Continue estudando! 💪");
      }
    } catch {
      toast.error("Erro ao finalizar simulado");
    }
  };

  const handleBackToMenu = () => {
    setSelectedLevel(null);
    setActiveSession(null);
    setIsFinished(false);
  };

  // Finished screen
  if (isFinished && selectedLevel) {
    const pct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const levelInfo = levels.find(l => l.level === selectedLevel)!;
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <Card className={`border-2 shadow-xl ${levelInfo.bg}`}>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="text-6xl">{pct >= 80 ? "🏆" : pct >= 60 ? "👏" : "📚"}</div>
            <h2 className="text-2xl font-bold">Simulado Finalizado!</h2>
            <p className="text-muted-foreground">Nível {levelInfo.emoji} {levelInfo.name}</p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{pct}%</div>
                <p className="text-xs text-muted-foreground">Acerto</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{sessionCorrect}/{sessionTotal}</div>
                <p className="text-xs text-muted-foreground">Corretas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
                <p className="text-xs text-muted-foreground">Tempo</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => handleStartSimulado(selectedLevel)} className="flex-1">
                🔄 Refazer
              </Button>
              <Button onClick={handleBackToMenu} variant="outline" className="flex-1">
                ← Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active quiz
  if (activeSession && selectedLevel && !isFinished) {
    const currentQuestion = questions[currentIndex];
    const levelInfo = levels.find(l => l.level === selectedLevel)!;

    if (questionsLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
      <div className="space-y-4 animate-fade-in">
        {/* Top bar */}
        <div className={`flex items-center justify-between p-3 rounded-xl border-2 ${levelInfo.bg}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{levelInfo.emoji}</span>
            <span className="font-bold text-sm">{levelInfo.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              {sessionCorrect}/{sessionTotal}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(elapsedTime)}
            </Badge>
            <span className="text-sm font-medium">{currentIndex + 1}/{questions.length}</span>
          </div>
        </div>

        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />

        {currentQuestion && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs capitalize">{currentQuestion.theme?.replace("_", " ")}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">Q{currentIndex + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentQuestion.scenario}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{currentQuestion.question}</p>

              {(currentQuestion.options as any[]).map((opt: any, idx: number) => {
                const isCorrectOption = answerResult ? idx === answerResult.correct_option : false;
                const isSelected = selectedOption === idx;
                let optionClass = "border p-3 rounded-lg cursor-pointer transition-all text-sm text-left w-full flex items-start gap-2";

                if (showResult && answerResult) {
                  if (isCorrectOption) optionClass += " border-success bg-success/10 text-success";
                  else if (isSelected) optionClass += " border-destructive bg-destructive/10 text-destructive";
                  else optionClass += " opacity-50 border-border";
                } else {
                  optionClass += " hover:border-primary hover:bg-primary/5 border-border";
                }

                return (
                  <button key={idx} className={optionClass} onClick={() => handleAnswer(idx)} disabled={showResult}>
                    <span className="font-medium shrink-0 w-6">{String.fromCharCode(65 + idx)}.</span>
                    <span>{opt.text}</span>
                    {showResult && answerResult && isCorrectOption && <CheckCircle2 className="h-4 w-4 shrink-0 ml-auto mt-0.5" />}
                    {showResult && answerResult && isSelected && !isCorrectOption && <XCircle className="h-4 w-4 shrink-0 ml-auto mt-0.5" />}
                  </button>
                );
              })}

              {showResult && answerResult?.explanation && (
                <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent mb-1">💡 Explicação</p>
                  <p className="text-sm text-muted-foreground">{answerResult.explanation}</p>
                </div>
              )}

              {showResult && (
                <Button onClick={handleNext} className="w-full mt-4">
                  {currentIndex >= questions.length - 1 ? "🏁 Finalizar Simulado" : "Próxima"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Menu screen
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-destructive" />
          <span className="bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">SIMULADO OFICIAL</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Prove seu nível. Cada nível é mais brutal que o anterior. Ranking em tempo real contra outros candidatos.
        </p>
      </div>

      {/* Level cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((l) => (
          <Card key={l.level} className={`border-2 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] ${l.bg}`} onClick={() => handleStartSimulado(l.level)}>
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="text-5xl">{l.emoji}</div>
              <h3 className="text-xl font-bold">Nível {l.level} — {l.name}</h3>
              <p className="text-sm text-muted-foreground">{l.description}</p>
              <div className="text-xs text-muted-foreground">50 questões • Cronometrado</div>
              <Button className={`w-full bg-gradient-to-r ${l.color} text-white border-0`}>
                Iniciar Simulado
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ranking & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking */}
        <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Ranking — Top 50
            </CardTitle>
            <div className="flex gap-1 flex-wrap">
              {levels.map(l => (
                <Button
                  key={l.level}
                  size="sm"
                  variant={rankingLevel === l.level ? "default" : "outline"}
                  onClick={() => setRankingLevel(l.level)}
                  className="text-xs h-7"
                >
                  {l.emoji} N{l.level}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-auto">
            {ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum resultado ainda. Seja o primeiro!</p>
            ) : (
              ranking.map((r: any, idx: number) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${r.user_id === user?.id ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"}`}>
                  <div className="flex items-center gap-3">
                    {getRankIcon(idx)}
                    <div>
                      <span className="text-sm font-medium">{r.full_name}</span>
                      {r.user_id === user?.id && <Badge variant="outline" className="ml-2 text-[10px]">Você</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-primary">{r.best_score}%</span>
                    {r.best_time && <span className="text-muted-foreground text-xs">{formatTime(r.best_time)}</span>}
                    <span className="text-muted-foreground text-xs">{r.attempts}x</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Seu Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-auto">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Complete um simulado para ver seu histórico.</p>
            ) : (
              history.map((h: any) => {
                const pct = h.total_questions > 0 ? Math.round((h.correct_answers / h.total_questions) * 100) : 0;
                const levelInfo = levels.find(l => l.level === h.level);
                return (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <span>{levelInfo?.emoji}</span>
                      <span className="text-sm font-medium">Nível {h.level}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant={pct >= 70 ? "default" : "outline"} className="text-xs">{pct}%</Badge>
                      <span className="text-xs text-muted-foreground">{h.correct_answers}/{h.total_questions}</span>
                      {h.time_seconds && <span className="text-xs text-muted-foreground">{formatTime(h.time_seconds)}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
