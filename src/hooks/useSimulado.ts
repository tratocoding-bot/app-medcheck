import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useSimuladoQuestions(level: number) {
  return useQuery({
    queryKey: ["simulado-questions", level],
    enabled: level >= 1 && level <= 5,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_simulado_questions", { p_level: level });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });
}

export function useSimuladoSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: async (level: number) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("simulado_sessions")
        .insert({ user_id: user.id, level })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });

  const submitAnswer = useMutation({
    mutationFn: async ({ sessionId, questionId, selectedOption }: {
      sessionId: string; questionId: string; selectedOption: number;
    }) => {
      const { data, error } = await supabase.rpc("submit_simulado_answer", {
        p_session_id: sessionId,
        p_question_id: questionId,
        p_selected_option: selectedOption,
      });
      if (error) throw error;
      return data as { is_correct: boolean; correct_option: number; explanation: string | null };
    },
  });

  const completeSession = useMutation({
    mutationFn: async ({ sessionId, timeSeconds }: { sessionId: string; timeSeconds: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("simulado_sessions")
        .update({ is_completed: true, completed_at: new Date().toISOString(), time_seconds: timeSeconds })
        .eq("id", sessionId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulado-ranking"] });
      queryClient.invalidateQueries({ queryKey: ["simulado-history"] });
    },
  });

  return { createSession, submitAnswer, completeSession };
}

export function useSimuladoRanking(level: number) {
  return useQuery({
    queryKey: ["simulado-ranking", level],
    enabled: level >= 1 && level <= 5,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_simulado_ranking", { p_level: level });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });
}

export function useSimuladoHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["simulado-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulado_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_completed", true)
        .order("completed_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}
