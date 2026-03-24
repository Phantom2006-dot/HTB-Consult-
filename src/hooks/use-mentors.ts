import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
    queryFn: () => api.get<Mentor[]>("/api/mentors"),
  });
}

export function useMentorDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["mentor", id],
    enabled: !!id,
    queryFn: () => api.get<{ mentor: Mentor; slots: AvailabilitySlot[] }>(`/api/mentors/${id}`),
  });
}
