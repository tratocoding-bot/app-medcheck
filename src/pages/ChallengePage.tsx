import React from 'react';
import { useDailyChallenge } from '@/hooks/useRetention';
import QuestionTrainer from '@/components/QuestionTrainer';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function ChallengePage() {
  const { data: question, isLoading, isError } = useDailyChallenge();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="flex items-center justify-center p-20 animate-pulse"><Flame className="w-8 h-8 text-orange-500 animate-bounce" /></div>;
  }

  if (isError || !question) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">Desafio indisponível</h2>
            <p className="text-muted-foreground mt-2">Volte amanhã para um novo caso clínico.</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
      </Button>
      
      <div className="flex items-center gap-3 p-4 bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 rounded-xl border border-orange-200 dark:border-orange-900/50">
        <Flame className="w-6 h-6" />
        <div>
            <h1 className="font-bold text-lg">Desafio do Dia</h1>
            <p className="text-sm opacity-90">Resolva sem consultar para testar a sua destreza real.</p>
        </div>
      </div>

      <QuestionTrainer 
        questions={[question]} 
        isLoading={false} 
        tabLabel="Desafio do Dia" 
      />
    </div>
  );
}
