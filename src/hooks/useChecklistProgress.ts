import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useChecklistProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress = [], isLoading } = useQuery({
    queryKey: ["checklist-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("checklist_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleItem = useMutation({
    mutationFn: async ({ itemId, checked }: { itemId: string; checked: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("checklist_progress")
        .upsert({
          user_id: user.id,
          item_id: itemId,
          checked,
          checked_at: checked ? new Date().toISOString() : null,
        }, { onConflict: "user_id,item_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-progress", user?.id] });
    },
  });

  const isChecked = (itemId: string) => {
    return progress.find((p) => p.item_id === itemId)?.checked === true;
  };

  const checkedCount = progress.filter((p) => p.checked).length;

  const recentItems = [...progress]
    .filter((p) => p.checked && p.checked_at)
    .sort((a, b) => new Date(b.checked_at!).getTime() - new Date(a.checked_at!).getTime())
    .slice(0, 5);

  return { progress, isLoading, toggleItem, isChecked, checkedCount, recentItems };
}
