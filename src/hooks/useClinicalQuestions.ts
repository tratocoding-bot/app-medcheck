import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClinicalQuestions() {
  return useQuery({
    queryKey: ["clinical-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinical_questions")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}
