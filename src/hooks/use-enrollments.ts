import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useEnrollments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollments", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/enrollments"),
  });
}

export function useEnroll() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Not authenticated");
      return api.post("/api/enrollments", { course_id: courseId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useUpdateProgress() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, progress }: { courseId: string; progress: number }) =>
      api.patch(`/api/enrollments/${courseId}/progress`, { progress }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
