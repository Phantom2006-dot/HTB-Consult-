import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Booking {
  id: string;
  mentor_id: string;
  student_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: {
      mentor_id: string;
      student_id: string;
      session_date: string;
      start_time: string;
      end_time: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert(booking)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-bookings"] });
    },
  });
}

export function useMyBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("student_id", user!.id)
        .order("session_date", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useMentorBookings(mentorId: string | undefined) {
  return useQuery({
    queryKey: ["mentor-bookings", mentorId],
    enabled: !!mentorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("mentor_id", mentorId!)
        .order("session_date", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-bookings"] });
    },
  });
}
