import { useMemo, useState } from "react";
import { Target, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClinicalQuestions } from "@/hooks/useClinicalQuestions";
import QuestionTrainer from "@/components/QuestionTrainer";

const specialtyTabs = [
  { key: "geral", label: "Geral", themes: null }, // null = all questions
  { key: "clinica_medica", label: "Clínica Médica", themes: ["clinica_medica", "cardiologia", "pneumologia", "nefrologia", "endocrinologia", "reumatologia", "gastroenterologia", "infectologia"] },
  { key: "cirurgia", label: "Cirurgia Geral", themes: ["cirurgia", "urgencia"] },
  { key: "ginecologia", label: "Ginecologia e Obstetrícia", themes: ["ginecologia"] },
  { key: "pediatria", label: "Pediatria", themes: ["pediatria"] },
  { key: "medicina_familia", label: "Med. Família", themes: ["medicina_familia", "etica"] },
  { key: "saude_coletiva", label: "Saúde Coletiva", themes: ["saude_coletiva"] },
  { key: "saude_mental", label: "Saúde Mental", themes: ["saude_mental"] },
];

export default function AprovacaoPage() {
  const { data: allQuestions = [], isLoading } = useClinicalQuestions();
  const [activeTab, setActiveTab] = useState("geral");

  const filteredQuestions = useMemo(() => {
    const tab = specialtyTabs.find(t => t.key === activeTab);
    if (!tab || !tab.themes) return allQuestions;
    return allQuestions.filter(q => tab.themes!.includes(q.theme));
  }, [allQuestions, activeTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Aprovação Geral
        </h1>
        <p className="text-muted-foreground">Treino clínico estilo ENAMED — raciocínio e decisão por cadeira médica</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Observation text above filter buttons */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
          <Info className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-sm text-primary font-medium">
            Selecione sua cadeira ou faça todas as perguntas em Geral
          </p>
        </div>

        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-lg">
          {specialtyTabs.map(tab => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {specialtyTabs.map(tab => (
          <TabsContent key={tab.key} value={tab.key}>
            <QuestionTrainer
              questions={filteredQuestions}
              isLoading={isLoading}
              tabLabel={tab.key}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
