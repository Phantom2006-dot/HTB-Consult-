import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsMentor() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-mentor", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentors")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
