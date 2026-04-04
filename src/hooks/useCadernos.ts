import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface CadernoFilters {
  themes: string[];
  difficulty: string | null;
  limit: number;
  onlyErrors: boolean;
}

export function useCadernoQuestions(filters: CadernoFilters, enabled: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['custom_questions', user?.id, filters],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase.rpc as any)('get_custom_questions', {
        _user_id: user.id,
        _limit: filters.limit,
        _themes: filters.themes.length > 0 ? filters.themes : null,
        _difficulty: filters.difficulty === 'todas' ? null : filters.difficulty,
        _only_errors: filters.onlyErrors
      });

      if (error) {
        console.error('Error fetching custom questions:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && enabled,
    staleTime: 0, 
  });
}
