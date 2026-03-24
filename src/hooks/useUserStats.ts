import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserStats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const ensureStats = async () => {
    if (!user) return null;
    const { data: existing } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) return existing;
    const { data, error } = await supabase
      .from("user_stats")
      .insert({ user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const recordAnswer = useMutation({
    mutationFn: async ({ questionId, selectedOption, isCorrect, theme }: {
      questionId: string;
      selectedOption: number;
      isCorrect: boolean;
      theme: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Insert answer — server-side triggers validate correctness and update stats
      const { error } = await supabase.from("user_answers").insert({
        user_id: user.id,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect, // Will be overridden server-side by trigger
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["user-answers", user?.id] });
    },
  });

  const resetProgress = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      // Delete all user answers
      const { error: delError } = await supabase
        .from("user_answers")
        .delete()
        .eq("user_id", user.id);
      if (delError) throw delError;
      // Reset stats to zero
      const { error: updError } = await supabase
        .from("user_stats")
        .update({
          xp: 0,
          streak: 0,
          questions_answered: 0,
          questions_correct: 0,
          enamed_score: 0,
          clinical_level: "interno",
          last_active_date: null,
        })
        .eq("user_id", user.id);
      if (updError) throw updError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["user-answers", user?.id] });
    },
  });

  return { stats, isLoading, recordAnswer, ensureStats, resetProgress };
}

export function useUserAnswers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-answers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_answers")
        .select("*, clinical_questions(theme)")
        .eq("user_id", user!.id)
        .order("answered_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useWeakPoints() {
  const { data: answers = [] } = useUserAnswers();

  const themeErrors: Record<string, { total: number; errors: number }> = {};
  answers.forEach((a: any) => {
    const theme = a.clinical_questions?.theme;
    if (!theme) return;
    if (!themeErrors[theme]) themeErrors[theme] = { total: 0, errors: 0 };
    themeErrors[theme].total += 1;
    if (!a.is_correct) themeErrors[theme].errors += 1;
  });

  const weakPoints = Object.entries(themeErrors)
    .map(([theme, data]) => ({
      theme,
      errorRate: data.total > 0 ? data.errors / data.total : 0,
      errors: data.errors,
      total: data.total,
    }))
    .filter(w => w.errors > 0)
    .sort((a, b) => b.errorRate - a.errorRate);

  return weakPoints;
}
