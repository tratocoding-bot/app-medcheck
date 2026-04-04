import React from 'react';
import { useSpacedRepetition } from '@/hooks/useRetention';
import QuestionTrainer from '@/components/QuestionTrainer';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, CheckCircle2, ArrowLeft, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function ReviewPage() {
  const { data: questions, isLoading, isError } = useSpacedRepetition();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="flex items-center justify-center p-20 animate-pulse"><Layers className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  if (isError || !questions) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Layers className="h-10 w-10 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">Erro ao carregar</h2>
            <p className="text-muted-foreground mt-2">Certifique-se que o script SQL foi executado.</p>
        </div>
    );
  }

  if (questions.length === 0) {
    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
            </Button>
            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Pilha Limpa!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Você não tem questões antigas pendentes para revisar hoje baseadas na curva de Ebbinghaus.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
      </Button>
      
      <div className="flex justify-between items-center p-4 bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-400 rounded-xl border border-sky-200 dark:border-sky-800/50">
        <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6" />
            <div>
                <h1 className="font-bold text-lg">Revisão Espaçada Ativa</h1>
                <p className="text-sm opacity-90">Cartões que você errou há 3, 7, 15 ou 30 dias.</p>
            </div>
        </div>
        <div className="text-right">
            <span className="text-2xl font-black">{questions.length}</span>
            <span className="text-xs block font-semibold uppercase opacity-70">Pendentes</span>
        </div>
      </div>

      <QuestionTrainer 
        questions={questions} 
        isLoading={false} 
        tabLabel="Revisão Espaçada" 
      />
    </div>
  );
}
