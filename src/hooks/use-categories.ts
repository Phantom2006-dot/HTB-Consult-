import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ id: string; name: string; created_at: string }[]>("/api/categories"),
  });
}
