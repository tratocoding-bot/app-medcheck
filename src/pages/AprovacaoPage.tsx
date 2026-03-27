import { useMemo, useState } from "react";
import { Target, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClinicalQuestions } from "@/hooks/useClinicalQuestions";
import QuestionTrainer from "@/components/QuestionTrainer";

const specialtyTabs = [
  { key: "geral", label: "Geral", themes: null, colorClass: "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary" },
  { key: "clinica_medica", label: "Clínica Médica", themes: ["clinica_medica", "cardiologia", "pneumologia", "nefrologia", "endocrinologia", "reumatologia", "gastroenterologia", "infectologia"], colorClass: "data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 dark:data-[state=active]:bg-blue-500" },
  { key: "cirurgia", label: "Cirurgia Geral", themes: ["cirurgia", "urgencia"], colorClass: "data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:border-orange-600 dark:data-[state=active]:bg-orange-500" },
  { key: "ginecologia", label: "Ginecologia e Obstetrícia", themes: ["ginecologia"], colorClass: "data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:border-pink-600 dark:data-[state=active]:bg-pink-500" },
  { key: "pediatria", label: "Pediatria", themes: ["pediatria"], colorClass: "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:border-purple-600 dark:data-[state=active]:bg-purple-500" },
  { key: "medicina_familia", label: "Med. Família", themes: ["medicina_familia", "etica"], colorClass: "data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-600 dark:data-[state=active]:bg-emerald-500" },
  { key: "saude_coletiva", label: "Saúde Coletiva", themes: ["saude_coletiva"], colorClass: "data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:border-cyan-600 dark:data-[state=active]:bg-cyan-500" },
  { key: "saude_mental", label: "Saúde Mental", themes: ["saude_mental"], colorClass: "data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-600 dark:data-[state=active]:bg-indigo-500" },
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

        <TabsList className="w-full flex flex-wrap justify-start h-auto gap-2 bg-transparent p-0 mb-4">
          {specialtyTabs.map(tab => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className={`text-xs sm:text-sm px-4 py-2 rounded-full border bg-card hover:bg-muted/50 transition-all shadow-sm data-[state=active]:shadow-md ${tab.colorClass}`}
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
