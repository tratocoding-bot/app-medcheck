import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useChecklistNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["checklist-notes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("checklist_notes")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveNote = useMutation({
    mutationFn: async ({ sectionId, content }: { sectionId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("checklist_notes")
        .upsert({
          user_id: user.id,
          section_id: sectionId,
          content,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,section_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-notes", user?.id] });
    },
  });

  const getNote = (sectionId: string) => {
    return notes.find((n) => n.section_id === sectionId)?.content ?? "";
  };

  return { notes, saveNote, getNote };
}
