import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  skill_level: string;
  price: number;
  thumbnail_url: string | null;
  tags: string[];
  rating: number;
  total_duration: string;
  instructor_id: string | null;
  live_class_url?: string | null;
  course_type: string;
  published: boolean;
  is_locked: boolean;
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
  content?: string | null;
  video_url?: string | null;
  duration: string;
  sort_order: number;
  is_free: boolean;
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get<Course[]>("/api/courses"),
  });
}

export function useCourseDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["course", id],
    enabled: !!id,
    queryFn: () => api.get<{ course: Course; modules: Module[] }>(`/api/courses/${id}`),
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}
