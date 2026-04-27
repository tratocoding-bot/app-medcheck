import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClinicalQuestions() {
  return useQuery({
    queryKey: ["clinical-questions"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_clinical_questions");
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });
}
