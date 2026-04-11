import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface UnreadCounts {
  emails: number;
  messages: number;
  notifications: number;
}

export function useUnreadCounts() {
  const { user } = useAuth();

  return useQuery<UnreadCounts>({
    queryKey: ["unread-counts"],
    queryFn: () => api.get<UnreadCounts>("/api/notifications/unread-count"),
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 20_000,
    initialData: { emails: 0, messages: 0, notifications: 0 },
  });
}
