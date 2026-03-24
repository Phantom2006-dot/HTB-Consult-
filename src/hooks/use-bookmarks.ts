import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookmarks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*, courses(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Not authenticated");
      // Check if already bookmarked
      const { data: existing } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existing) {
        await supabase.from("bookmarks").delete().eq("id", existing.id);
        return { action: "removed" as const };
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, course_id: courseId });
        return { action: "added" as const };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
