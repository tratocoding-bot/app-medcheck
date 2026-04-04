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
      // Busca a questão inteira através da nossa RPC segura
      const { data, error } = await (supabase.rpc as any)('get_daily_challenge');

      if (error) {
        console.error('Error fetching daily question via RPC:', error);
        return null;
      }

      return (data && data.length > 0) ? data[0] : null;
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
