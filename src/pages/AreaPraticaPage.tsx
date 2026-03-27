import { useParams } from "react-router-dom";
import { Info } from "lucide-react";
import { useClinicalQuestions } from "@/hooks/useClinicalQuestions";
import QuestionTrainer from "@/components/QuestionTrainer";
import { themeInfo } from "@/data/clinicalQuestions";

export default function AreaPraticaPage() {
  const { area } = useParams<{ area: string }>();
  const { data: allQuestions = [], isLoading } = useClinicalQuestions();

  // Map the URL parameter to the correct themes
  let mappedThemes: string[] = [];
  let areaTitle = "Área Prática";
  let areaIcon = "🩺";
  
  switch(area) {
    case "clinica_medica":
      mappedThemes = ["clinica_medica", "cardiologia", "pneumologia", "nefrologia", "endocrinologia", "reumatologia", "gastroenterologia", "infectologia"];
      areaTitle = "Clínica Médica";
      areaIcon = "🩺";
      break;
    case "cirurgia":
      mappedThemes = ["cirurgia", "urgencia"];
      areaTitle = "Cirurgia Geral";
      areaIcon = "🔪";
      break;
    case "ginecologia":
      mappedThemes = ["ginecologia"];
      areaTitle = "Ginecologia e Obstetrícia";
      areaIcon = "🤰";
      break;
    case "pediatria":
      mappedThemes = ["pediatria"];
      areaTitle = "Pediatria";
      areaIcon = "👶";
      break;
    case "medicina_familia":
      mappedThemes = ["medicina_familia", "etica"];
      areaTitle = "Med. Família";
      areaIcon = "🏠";
      break;
    case "saude_coletiva":
      mappedThemes = ["saude_coletiva"];
      areaTitle = "Saúde Coletiva";
      areaIcon = "🏥";
      break;
    case "saude_mental":
      mappedThemes = ["saude_mental"];
      areaTitle = "Saúde Mental";
      areaIcon = "🧠";
      break;
    default:
      mappedThemes = [];
  }

  const filteredQuestions = allQuestions.filter(q => mappedThemes.includes(q.theme));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-2xl">{areaIcon}</span>
          <span className="text-primary">{areaTitle}</span>
        </h1>
        <p className="text-muted-foreground">Prática focada com 500 questões de {areaTitle}</p>
      </div>

      <QuestionTrainer
        questions={filteredQuestions}
        isLoading={isLoading}
        tabLabel={area || "area"}
      />
    </div>
  );
}
