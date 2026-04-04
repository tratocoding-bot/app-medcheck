import React from 'react';
import { useWeeklyLeaderboard } from '@/hooks/useRetention';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Star, Flame, Crown, AlertOctagon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

function getLiga(xp: number) {
  if (xp >= 1000) return { name: 'Liga R1 (Elite)', color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', border: 'border-violet-200 dark:border-violet-800', icon: Crown };
  if (xp >= 500) return { name: 'Liga Ouro', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', icon: Star };
  if (xp >= 200) return { name: 'Liga Prata', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-700', icon: Medal };
  return { name: 'Liga Bronze', color: 'text-amber-700', bg: 'bg-amber-100/50 dark:bg-amber-900/20', border: 'border-amber-200/50 dark:border-amber-900/50', icon: Trophy };
}

export default function RankingPage() {
  const { data: leaderboard, isLoading, isError } = useWeeklyLeaderboard();
  const { user } = useAuth();

  if (isLoading) return <div className="flex justify-center p-20"><Trophy className="w-8 h-8 animate-pulse text-yellow-500" /></div>;

  const myEntry = leaderboard?.find(entry => entry.user_id === user?.id);
  const myXp = myEntry?.weekly_xp || 0;
  const myLiga = getLiga(myXp);
  const myRankIndex = leaderboard?.findIndex(entry => entry.user_id === user?.id) ?? -1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-6">
        <h1 className="text-3xl font-black mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" /> Ligas Angelicais
        </h1>
        <p className="text-muted-foreground">O quadro zera todo domingo à meia noite. Responda questões durante a semana para subir de Liga!</p>
      </div>

      {isError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="pt-6 flex flex-col items-center text-red-600">
                <AlertOctagon className="w-10 h-10 mb-2" />
                <p className="font-semibold">Erro ao processar as Ligas</p>
                <p className="text-sm opacity-80">Rode o script SQL de Retenção Diária.</p>
            </CardContent>
        </Card>
      )}

      {/* Cartão do Usuário */}
      <Card className={`border-2 ${myLiga.border} ${myLiga.bg} shadow-md overflow-hidden relative`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <myLiga.icon className="w-32 h-32" />
        </div>
        <CardContent className="pt-6 relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className={`w-20 h-20 rounded-full bg-white dark:bg-slate-900 shadow-inner flex items-center justify-center border-4 ${myLiga.border}`}>
                <myLiga.icon className={`w-10 h-10 ${myLiga.color}`} />
            </div>
            <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Status Atual</p>
                <h2 className={`text-2xl font-black ${myLiga.color}`}>{myLiga.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                    <span className="font-medium bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full text-sm">
                        {myXp} XP na semana
                    </span>
                    {myRankIndex !== -1 && (
                        <span className="font-bold text-sm">
                            #{myRankIndex + 1} no Mundo
                        </span>
                    )}
                </div>
            </div>
            <div className="w-full sm:w-1/3 space-y-2 text-sm font-semibold text-center mt-4 sm:mt-0">
                <p>Próximo Nível</p>
                <Progress value={myXp >= 1000 ? 100 : myXp >= 500 ? (myXp/1000)*100 : myXp >= 200 ? (myXp/500)*100 : (myXp/200)*100} className="h-2.5 bg-black/10" />
                <p className="text-xs opacity-70">
                    {myXp >= 1000 ? 'Nível Máximo Alcançado!' : `Continue praticando`}
                </p>
            </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Top 50 - Ranking da Semana
            </CardTitle>
        </CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaderboard?.map((entry, idx) => {
                const liga = getLiga(entry.weekly_xp);
                const isMe = entry.user_id === user?.id;

                return (
                    <div key={entry.user_id} className={`flex items-center gap-4 p-4 transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                        <div className="w-8 flex justify-center text-slate-400 font-bold text-lg">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold ${isMe ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {entry.full_name || 'Usuário Sem Nome'}
                                </span>
                                {isMe && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Você</span>}
                            </div>
                            <span className="text-xs text-muted-foreground">{entry.perfil || 'Estudante'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-lg tabular-nums tracking-tight">{entry.weekly_xp} <span className="text-xs text-muted-foreground font-medium">XP</span></span>
                            <div className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold ${liga.color}`}>
                                <liga.icon className="w-3 h-3" />
                                {liga.name}
                            </div>
                        </div>
                    </div>
                )
            })}
            
            {(!leaderboard || leaderboard.length === 0) && !isError && (
                <div className="p-8 text-center text-muted-foreground">
                    <p>O Ranking está vazio nesta semana!</p>
                    <p className="text-sm mt-1">Acaba de começar. Responda uma questão para ser o #1.</p>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
}
