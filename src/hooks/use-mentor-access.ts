import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useIsMentor() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-mentor", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const data = await api.get<any>("/api/mentors/me");
      return !!data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
