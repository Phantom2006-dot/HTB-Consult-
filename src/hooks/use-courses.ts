import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  live_class_url: string | null;
  course_type: string;
  published: boolean;
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
  content: string | null;
  video_url: string | null;
  duration: string;
  sort_order: number;
  is_free: boolean;
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useCourseDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["course", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;

      const { data: modules } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", id!)
        .order("sort_order");

      const moduleIds = (modules || []).map((m: any) => m.id);
      let lessons: Lesson[] = [];
      if (moduleIds.length > 0) {
        const { data: lessonData } = await supabase
          .from("lessons")
          .select("*")
          .in("module_id", moduleIds)
          .order("sort_order");
        lessons = (lessonData || []) as Lesson[];
      }

      const modulesWithLessons = (modules || []).map((m: any) => ({
        ...m,
        lessons: lessons.filter((l) => l.module_id === m.id),
      })) as Module[];

      return { course: course as Course, modules: modulesWithLessons };
    },
  });
}
