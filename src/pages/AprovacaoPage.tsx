import { Target, Info } from "lucide-react";
import { useClinicalQuestions } from "@/hooks/useClinicalQuestions";
import QuestionTrainer from "@/components/QuestionTrainer";

export default function AprovacaoPage() {
  const { data: allQuestions = [], isLoading } = useClinicalQuestions();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          PER. GERAIS
        </h1>
        <p className="text-muted-foreground">Treino clínico estilo ENAMED — raciocínio e decisão</p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
        <Info className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-sm text-primary font-medium">
          Pratique com todas as questões disponíveis
        </p>
      </div>

      <QuestionTrainer
        questions={allQuestions}
        isLoading={isLoading}
        tabLabel="geral"
      />
    </div>
  );
}
