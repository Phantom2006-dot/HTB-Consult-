import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Clock, User, CheckCircle, XCircle, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMentorBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-accent/15 text-accent border-accent/30",
  confirmed: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  completed: "bg-green-500/15 text-green-400 border-green-500/30",
};

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const updateStatus = useUpdateBookingStatus();

  // Get mentor record linked to this user
  const { data: mentorRecord, isLoading: mentorLoading } = useQuery({
    queryKey: ["my-mentor-record", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any>("/api/mentors/me").catch(() => null),
  });

  const { data: bookings, isLoading: bookingsLoading } = useMentorBookings(mentorRecord?.id);

  // Fetch student profiles for display
  const studentIds = [...new Set((bookings || []).map(b => b.student_id))];
  const { data: studentProfiles } = useQuery({
    queryKey: ["student-profiles", studentIds],
    enabled: studentIds.length > 0,
    queryFn: () => api.post<any[]>("/api/admin/users/batch", { ids: studentIds }),
  });

  const getStudentName = (studentId: string) => {
    const profile = studentProfiles?.find(p => p.user_id === studentId);
    return profile?.full_name || "Student";
  };

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user]);

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: bookingId, status });
      toast({ title: `Session ${status}`, description: `The session has been ${status}.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const pendingBookings = (bookings || []).filter(b => b.status === "pending");
  const upcomingBookings = (bookings || []).filter(b => b.status === "confirmed");
  const pastBookings = (bookings || []).filter(b => ["completed", "cancelled"].includes(b.status));

  if (loading || mentorLoading) {
    return (
      <SidebarLayout>
        <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </SidebarLayout>
    );
  }

  if (!mentorRecord) {
    return (
      <SidebarLayout>
        <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto text-center py-20">
          <h1 className="text-xl font-bold text-foreground mb-2">Mentor Access Only</h1>
          <p className="text-sm text-muted-foreground mb-4">
            This dashboard is for mentors. Your account is not linked to a mentor profile.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </SidebarLayout>
    );
  }

  const BookingCard = ({ booking }: { booking: typeof bookings extends (infer T)[] | undefined ? T : never }) => {
    if (!booking) return null;
    return (
      <Card className="border-border bg-card hover:border-primary/20 transition-colors">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <User size={14} /> {getStudentName(booking.student_id)}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarDays size={12} /> {format(new Date(booking.session_date), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} /> {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
              </p>
            </div>
            <Badge variant="outline" className={statusColors[booking.status] || ""}>
              {booking.status}
            </Badge>
          </div>
          {booking.notes && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{booking.notes}</p>
          )}
          {booking.status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" className="gap-1" onClick={() => handleStatusUpdate(booking.id, "confirmed")}>
                <CheckCircle size={12} /> Accept
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleStatusUpdate(booking.id, "cancelled")}>
                <XCircle size={12} /> Decline
              </Button>
            </div>
          )}
          {booking.status === "confirmed" && (
            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(booking.id, "completed")}>
              Mark Completed
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1">
            Mentor Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Manage your sessions and bookings</p>
        </motion.div>

        {/* Notification banner for pending */}
        {pendingBookings.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}>
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Bell size={18} className="text-accent" />
                <p className="text-sm text-foreground">
                  You have <span className="font-bold text-accent">{pendingBookings.length}</span> pending session request{pendingBookings.length > 1 ? "s" : ""} awaiting your response.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-1">
                Pending {pendingBookings.length > 0 && <Badge variant="secondary" className="text-[10px] px-1.5">{pendingBookings.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {bookingsLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
              ) : pendingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No pending requests</p>
              ) : (
                pendingBookings.map(b => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-3">
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No upcoming sessions</p>
              ) : (
                upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3">
              {pastBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No past sessions</p>
              ) : (
                pastBookings.map(b => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default MentorDashboard;
