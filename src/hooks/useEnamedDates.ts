import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEnamedDates() {
  return useQuery({
    queryKey: ["enamed-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enamed_dates")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
