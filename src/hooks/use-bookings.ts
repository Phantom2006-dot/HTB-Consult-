import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
    }) => api.post<Booking>("/api/bookings", booking),
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
    queryFn: () => api.get<Booking[]>("/api/bookings"),
  });
}

export function useMentorBookings(mentorId: string | undefined) {
  return useQuery({
    queryKey: ["mentor-bookings", mentorId],
    enabled: !!mentorId,
    queryFn: () => api.get<Booking[]>(`/api/bookings/mentor/${mentorId}`),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.patch<Booking>(`/api/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-bookings"] });
    },
  });
}
