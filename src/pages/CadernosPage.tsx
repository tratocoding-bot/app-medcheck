import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { themeInfo } from "@/data/clinicalQuestions";
import { useCadernoQuestions, CadernoFilters } from "@/hooks/useCadernos";
import QuestionTrainer from "@/components/QuestionTrainer";
import { ArrowLeft, BookOpen, Search, AlertCircle, Settings2, SlidersHorizontal, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function CadernosPage() {
  const location = useLocation();
  const initialOnlyErrors = location.state?.onlyErrors || false;

  const [isConfiguring, setIsConfiguring] = useState(true);
  const [filters, setFilters] = useState<CadernoFilters>({
    themes: [],
    difficulty: 'todas',
    limit: 10,
    onlyErrors: initialOnlyErrors,
  });

  const [activeFilters, setActiveFilters] = useState<CadernoFilters | null>(null);

  const { data: questions, isLoading, isError, error } = useCadernoQuestions(
    activeFilters as CadernoFilters, 
    !isConfiguring && activeFilters !== null
  );

  const handleToggleTheme = (theme: string) => {
    setFilters(prev => ({
      ...prev,
      themes: prev.themes.includes(theme) 
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }));
  };

  const handleGenerate = () => {
    setActiveFilters(filters);
    setIsConfiguring(false);
  };

  if (!isConfiguring) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setIsConfiguring(true)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos filtros
        </Button>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <h1 className="text-2xl font-bold">Caderno Personalizado</h1>
          <Badge variant="secondary" className="ml-2 font-medium">
            {(questions as any[])?.length || 0} Questões
          </Badge>
          {activeFilters?.onlyErrors && (
            <Badge variant="destructive" className="ml-2 font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-none">
              Apenas Seus Erros
            </Badge>
          )}
        </div>
        
        {isError ? (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50">
            <CardContent className="pt-6 text-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Erro ao gerar caderno. O Filtro de Erros requer que a função 'get_custom_questions' esteja rodando no Supabase. Execute o script do banco de dados.</p>
              <pre className="text-xs mt-2 opacity-70">{(error as any)?.message}</pre>
            </CardContent>
          </Card>
        ) : (
          <QuestionTrainer 
            questions={(questions as any[]) || []} 
            isLoading={isLoading} 
            tabLabel="Caderno Customizado" 
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2.5 rounded-xl">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Criar Caderno</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure um simulado focado exatamente no que você precisa.</p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            Configurações do Caderno
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          {/* Especialidades */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(themeInfo).map(([key, info]) => {
                const isSelected = filters.themes.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => handleToggleTheme(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{info.icon}</span> {info.label}
                  </button>
                );
              })}
            </div>
            {filters.themes.length === 0 && (
              <p className="text-xs text-slate-500 italic">Nenhuma selecionada (irá puxar de todas as cadeiras)</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dificuldade */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Dificuldade</h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {['todas', 'facil', 'media', 'dificil'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setFilters(prev => ({...prev, difficulty: diff}))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                      filters.difficulty === diff 
                        ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Número de Questões */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Quantidade</h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {[5, 10, 20, 50, 100].map(num => (
                  <button
                    key={num}
                    onClick={() => setFilters(prev => ({...prev, limit: num}))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      filters.limit === num 
                        ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtro de Erros */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-900/30 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/20">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  checked={filters.onlyErrors}
                  onChange={(e) => setFilters(prev => ({...prev, onlyErrors: e.target.checked}))}
                  className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-600 focus:ring-2"
                />
              </div>
              <div>
                <span className="block text-sm font-semibold text-rose-900 dark:text-rose-400">Caderno de Erros (Apenas questões que eu já errei)</span>
                <span className="block text-sm text-rose-700/80 dark:text-rose-400/80 mt-1">Acione este filtro para revisar exclusivamente os seus pontos fracos e usar repetição espaçada no seu estudo.</span>
              </div>
            </label>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleGenerate}
          className="h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2"
        >
          <Search className="w-5 h-5" />
          Gerar Caderno
        </Button>
      </div>

    </div>
  );
}
