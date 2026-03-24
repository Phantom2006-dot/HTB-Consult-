import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Mentor {
  id: string;
  name: string;
  avatar_url: string | null;
  title: string;
  bio: string;
  specializations: string[];
  years_experience: number;
  rating: number;
  total_sessions: number;
  hourly_rate: number;
  published: boolean;
}

export interface AvailabilitySlot {
  id: string;
  mentor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export function useMentors() {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .eq("published", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as Mentor[];
    },
  });
}

export function useMentorDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["mentor", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: mentor, error } = await supabase
        .from("mentors")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;

      const { data: slots } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("mentor_id", id!)
        .eq("is_active", true)
        .order("day_of_week");

      return { mentor: mentor as Mentor, slots: (slots || []) as AvailabilitySlot[] };
    },
  });
}
