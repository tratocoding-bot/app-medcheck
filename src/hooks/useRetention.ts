import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

// 1. Hook para Revisão Espaçada (Curva Ebbinghaus)
export function useSpacedRepetition(enabled: boolean = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spaced_repetition', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase.rpc as any)('get_spaced_repetition_questions', {
        _user_id: user.id
      });
      if (error) {
        console.error('Error fetching spaced repetition:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// 2. Hook para Desafio do Dia (Baseado na Data)
export function useDailyChallenge() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily_challenge', new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      // Pega a contagem exata para sorteio seguro sem extrapolar limites
      const { count, error: countError } = await supabase
        .from('clinical_questions')
        .select('*', { count: 'exact', head: true });
        
      if (countError || count === null || count === 0) {
        console.error('Error fetching questions count:', countError);
        return null;
      }
      
      // Cria uma seed determinística local (YYYY-MM-DD)
      const todayString = new Date().toISOString().split('T')[0];
      let seed = 0;
      for (let i = 0; i < todayString.length; i++) {
        seed += todayString.charCodeAt(i);
      }
      
      // Seleciona o index
      const targetIndex = seed % count;

      // Busca a questão completa no servidor usando paginação com ordem estrita
      const { data: questions, error: qError } = await supabase
        .from('clinical_questions')
        .select('*')
        .order('id')
        .range(targetIndex, targetIndex);

      if (qError) {
        console.error('Error fetching daily question:', qError);
        return null;
      }

      return (questions && questions.length > 0) ? questions[0] : null;
    },
    enabled: !!user,
    staleTime: Infinity, // Só recarrega no outro dia
  });
}

// 3. Hook para o Ranking Semanal
export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  perfil: string;
  weekly_xp: number;
}

export function useWeeklyLeaderboard() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['weekly_leaderboard'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase.rpc as any)('get_weekly_leaderboard');
      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
      return data as LeaderboardEntry[];
    },
    enabled: !!user,
  });
}
