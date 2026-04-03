import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUserStats, useUserAnswers, useWeakPoints } from "@/hooks/useUserStats";
import { themeInfo, getLevelForXP, getScoreLevel, calculateEnamedScore } from "@/data/clinicalQuestions";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { getAllItems } from "@/data/checklistData";
import { CheckCircle2, XCircle, Trophy, Flame, Brain, Target, ArrowRight, RotateCcw, Lock, Zap, Trash2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface QuestionTrainerProps {
  questions: any[];
  isLoading: boolean;
  tabLabel: string;
}

export default function QuestionTrainer({ questions, isLoading, tabLabel }: QuestionTrainerProps) {
  const { data: answers = [] } = useUserAnswers();
  const { stats, recordAnswer, ensureStats, resetXP, resetStreak, resetAccuracy, resetScore } = useUserStats();
  const weakPoints = useWeakPoints();
  const { checkedCount } = useChecklistProgress();
  const totalItems = getAllItems().length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  useEffect(() => { ensureStats(); }, []);

  // Reset state when tab changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setSessionCorrect(0);
    setSessionTotal(0);
  }, [tabLabel]);

  const answeredIds = new Set(answers.map((a: any) => a.question_id));
  const unlockedCount = Math.min(questions.length, 10 + Math.floor((stats?.xp ?? 0) / 15));

  const xp = stats?.xp ?? 0;
  const streak = stats?.streak ?? 0;
  const level = getLevelForXP(xp);
  const nextLevel = getLevelForXP(xp).maxXP === Infinity ? null : getLevelForXP(xp);
  const accuracy = (stats?.questions_answered ?? 0) > 0
    ? (stats?.questions_correct ?? 0) / (stats?.questions_answered ?? 0)
    : 0;
  const enamedScore = calculateEnamedScore(
    accuracy,
    streak,
    totalItems > 0 ? checkedCount / totalItems : 0
  );
  const scoreLevel = getScoreLevel(enamedScore);

  const currentQuestion = questions[currentIndex];

  const [answerResult, setAnswerResult] = useState<{ correct_option: number; explanation: string | null } | null>(null);

  const handleAnswer = async (optionIndex: number) => {
    if (showResult || !currentQuestion) return;
    setSelectedOption(optionIndex);
    setShowResult(true);

    try {
      const result = await recordAnswer.mutateAsync({
        questionId: currentQuestion.id,
        selectedOption: optionIndex,
      });

      setAnswerResult({ correct_option: result.correct_option, explanation: result.explanation });
      setSessionTotal(prev => prev + 1);
      if (result.is_correct) {
        setSessionCorrect(prev => prev + 1);
        toast.success("+15 XP! ✓ Resposta correta", { duration: 2000 });
        if ((sessionCorrect + 1) % 5 === 0) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        }
      } else {
        toast.error("+3 XP — Revise esta área", { duration: 2000 });
      }
    } catch {
      toast.error("Erro ao enviar resposta");
      setShowResult(false);
      setSelectedOption(null);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    setAnswerResult(null);
    if (currentIndex < Math.min(questions.length - 1, unlockedCount - 1)) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setSessionCorrect(0);
    setSessionTotal(0);
  };

  // Individual reset handlers
  const handleResetXP = async () => {
    if (!confirm("Tem certeza que deseja resetar o XP? Esta ação não pode ser desfeita.")) return;
    try {
      await resetXP.mutateAsync();
      toast.success("XP resetado com sucesso!");
    } catch {
      toast.error("Erro ao resetar XP");
    }
  };

  const handleResetStreak = async () => {
    if (!confirm("Tem certeza que deseja resetar a sequência de dias? Esta ação não pode ser desfeita.")) return;
    try {
      await resetStreak.mutateAsync();
      toast.success("Sequência resetada com sucesso!");
    } catch {
      toast.error("Erro ao resetar sequência");
    }
  };

  const handleResetAccuracy = async () => {
    if (!confirm("Tem certeza que deseja resetar a taxa de acerto e todas as respostas? Esta ação não pode ser desfeita.")) return;
    try {
      await resetAccuracy.mutateAsync();
      handleRestart();
      toast.success("Taxa de acerto e respostas resetadas!");
    } catch {
      toast.error("Erro ao resetar taxa de acerto");
    }
  };

  const handleResetScore = async () => {
    if (!confirm("Tem certeza que deseja resetar o ENAMED Score? Esta ação não pode ser desfeita.")) return;
    try {
      await resetScore.mutateAsync();
      toast.success("ENAMED Score resetado com sucesso!");
    } catch {
      toast.error("Erro ao resetar score");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (questions.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="font-medium">Nenhuma questão disponível para esta cadeira.</p>
          <p className="text-sm text-muted-foreground mt-1">Em breve novas questões serão adicionadas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats bar with individual reset buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-primary">{level.emoji} {level.label}</div>
            <p className="text-xs text-muted-foreground">{xp} XP</p>
            <Progress value={nextLevel ? ((xp - level.minXP) / (level.maxXP - level.minXP + 1)) * 100 : 100} className="h-1.5 mt-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetXP}
              disabled={resetXP.isPending}
              className="mt-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
              title="Resetar XP"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Resetar
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">{streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Dias seguidos</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetStreak}
              disabled={resetStreak.isPending}
              className="mt-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
              title="Resetar Sequência"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Resetar
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-success">{Math.round(accuracy * 100)}%</div>
            <p className="text-xs text-muted-foreground">Taxa de acerto</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAccuracy}
              disabled={resetAccuracy.isPending}
              className="mt-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
              title="Resetar Taxa de Acerto"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Resetar
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-accent">{enamedScore}</div>
            <p className="text-xs text-muted-foreground">ENAMED Score — {scoreLevel.label}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetScore}
              disabled={resetScore.isPending}
              className="mt-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
              title="Resetar ENAMED Score"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Resetar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ENAMED Score bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1"><Trophy className="h-4 w-4 text-warning" /> ENAMED Score</span>
            <span className="text-sm font-bold">{enamedScore}/1000</span>
          </div>
          <Progress value={enamedScore / 10} className="h-2" />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>Iniciante</span><span>Básico</span><span>Intermediário</span><span>Avançado</span><span>Pronto</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Session progress */}
          <div className="flex items-center gap-3">
            <Progress value={(currentIndex / Math.max(unlockedCount, 1)) * 100} className="h-2 flex-1" />
            <span className="text-sm text-muted-foreground">{currentIndex + 1}/{unlockedCount}</span>
            {sessionTotal > 0 && (
              <Badge variant="outline" className="text-xs">
                {sessionCorrect}/{sessionTotal} nesta sessão
              </Badge>
            )}
          </div>

          {currentQuestion && currentIndex < unlockedCount ? (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {themeInfo[currentQuestion.theme]?.icon} {themeInfo[currentQuestion.theme]?.label ?? currentQuestion.theme}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">{currentQuestion.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">Q{currentIndex + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{currentQuestion.scenario}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{currentQuestion.question}</p>

                {(currentQuestion.options as any[]).map((opt: any, idx: number) => {
                  const isCorrectOption = opt.is_correct;
                  const isSelected = selectedOption === idx;
                  let optionClass = "border p-3 rounded-lg cursor-pointer transition-all text-sm text-left w-full flex items-start gap-2";

                  if (showResult) {
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
                      {showResult && isCorrectOption && <CheckCircle2 className="h-4 w-4 shrink-0 ml-auto mt-0.5" />}
                      {showResult && isSelected && !isCorrectOption && <XCircle className="h-4 w-4 shrink-0 ml-auto mt-0.5" />}
                    </button>
                  );
                })}

                {showResult && currentQuestion.explanation && (
                  <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-sm font-medium text-accent mb-1">💡 Explicação</p>
                    <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                )}

                {showResult && (
                  <div className="flex gap-2 mt-4">
                    {currentIndex < unlockedCount - 1 ? (
                      <Button onClick={handleNext} className="flex-1">
                        Próxima <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleRestart} variant="outline" className="flex-1">
                        <RotateCcw className="mr-2 h-4 w-4" /> Recomeçar
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">Ganhe mais XP para desbloquear questões!</p>
                <p className="text-sm text-muted-foreground mt-1">Desbloqueadas: {unlockedCount}/{questions.length}</p>
                <Button onClick={handleRestart} variant="outline" className="mt-4">
                  <RotateCcw className="mr-2 h-4 w-4" /> Refazer questões
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Question grid */}
          <div className="grid grid-cols-10 gap-1.5">
            {questions.map((q, idx) => {
              const answered = answeredIds.has(q.id);
              const wasCorrect = answers.find((a: any) => a.question_id === q.id)?.is_correct;
              const locked = idx >= unlockedCount;

              return (
                <button
                  key={q.id}
                  onClick={() => { if (!locked) { setCurrentIndex(idx); setSelectedOption(null); setShowResult(false); } }}
                  className={`h-8 rounded text-xs font-medium transition-all ${
                    locked ? "bg-muted text-muted-foreground cursor-not-allowed" :
                    idx === currentIndex ? "bg-primary text-primary-foreground" :
                    answered && wasCorrect ? "bg-success/20 text-success border border-success/30" :
                    answered ? "bg-destructive/20 text-destructive border border-destructive/30" :
                    "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                  disabled={locked}
                  title={locked ? "🔒 Bloqueada" : `Q${idx + 1}`}
                >
                  {locked ? <Lock className="h-3 w-3 mx-auto" /> : idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Você precisa revisar isso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weakPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">Responda questões para ver seus pontos fracos.</p>
              ) : (
                weakPoints.slice(0, 5).map((wp) => (
                  <div key={wp.theme} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="flex items-center gap-2">
                      <span>{themeInfo[wp.theme]?.icon}</span>
                      <span className="text-sm font-medium">{themeInfo[wp.theme]?.label ?? wp.theme}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {Math.round(wp.errorRate * 100)}% erro
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                Estatísticas do Treino
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questões respondidas</span>
                <span className="font-medium">{stats?.questions_answered ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acertos totais</span>
                <span className="font-medium text-success">{stats?.questions_correct ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP total</span>
                <span className="font-medium">{xp}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desbloqueadas</span>
                <span className="font-medium">{unlockedCount}/{questions.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
