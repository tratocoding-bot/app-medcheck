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
    mutationFn: async ({ questionId, selectedOption }: {
      questionId: string;
      selectedOption: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("submit_answer", {
        p_question_id: questionId,
        p_selected_option: selectedOption,
      });
      if (error) throw error;
      return data as { is_correct: boolean; correct_option: number; explanation: string | null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["user-answers", user?.id] });
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["user-stats", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["user-answers", user?.id] });
  };

  const resetXP = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.rpc("reset_user_stats", { p_reset_type: "xp" });
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const resetStreak = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.rpc("reset_user_stats", { p_reset_type: "streak" });
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const resetAccuracy = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.rpc("reset_user_stats", { p_reset_type: "accuracy" });
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const resetScore = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.rpc("reset_user_stats", { p_reset_type: "score" });
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const resetProgress = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.rpc("reset_user_stats", { p_reset_type: "all" });
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  return { stats, isLoading, recordAnswer, ensureStats, resetProgress, resetXP, resetStreak, resetAccuracy, resetScore };
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
