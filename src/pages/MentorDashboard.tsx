import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays, Clock, User, CheckCircle, XCircle, Bell,
  Pencil, Save, Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMentorBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface DaySlot {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

const defaultDaySlots = (): DaySlot[] =>
  DAYS.map((_, i) => ({
    enabled: i >= 1 && i <= 5,
    start_time: "09:00",
    end_time: "17:00",
  }));

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
  const qc = useQueryClient();
  const updateStatus = useUpdateBookingStatus();

  const [profileForm, setProfileForm] = useState({
    name: "", title: "", bio: "", avatar_url: "",
    specializations: "", years_experience: "0", hourly_rate: "0",
  });
  const [daySlots, setDaySlots] = useState<DaySlot[]>(defaultDaySlots());
  const [profileTab, setProfileTab] = useState("details");

  const { data: mentorRecord, isLoading: mentorLoading } = useQuery({
    queryKey: ["my-mentor-record", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any>("/api/mentors/me").catch(() => null),
  });

  const { data: mySlots } = useQuery({
    queryKey: ["my-mentor-slots", mentorRecord?.id],
    enabled: !!mentorRecord?.id,
    queryFn: () => api.get<any[]>("/api/mentors/me/slots"),
  });

  const { data: bookings, isLoading: bookingsLoading } = useMentorBookings(mentorRecord?.id);

  const studentIds = [...new Set((bookings || []).map((b: any) => b.student_id))];
  const { data: studentProfiles } = useQuery({
    queryKey: ["student-profiles", studentIds],
    enabled: studentIds.length > 0,
    queryFn: () => api.post<any[]>("/api/admin/users/batch", { ids: studentIds }),
  });

  const getStudentName = (studentId: string) => {
    const profile = studentProfiles?.find((p: any) => p.user_id === studentId);
    return profile?.full_name || "Student";
  };

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user]);

  useEffect(() => {
    if (!mentorRecord) return;
    setProfileForm({
      name: mentorRecord.name || "",
      title: mentorRecord.title || "",
      bio: mentorRecord.bio || "",
      avatar_url: mentorRecord.avatar_url || "",
      specializations: (mentorRecord.specializations || []).join(", "),
      years_experience: String(mentorRecord.years_experience ?? 0),
      hourly_rate: String(mentorRecord.hourly_rate ?? 0),
    });
  }, [mentorRecord]);

  useEffect(() => {
    if (!mySlots) return;
    const slots = defaultDaySlots();
    for (const s of mySlots) {
      slots[s.day_of_week] = {
        enabled: true,
        start_time: s.start_time.slice(0, 5),
        end_time: s.end_time.slice(0, 5),
      };
    }
    setDaySlots(slots);
  }, [mySlots]);

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: bookingId, status });
      toast({ title: `Session ${status}`, description: `The session has been ${status}.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const saveProfile = useMutation({
    mutationFn: async () => {
      await api.patch("/api/mentors/me", {
        name: profileForm.name,
        title: profileForm.title,
        bio: profileForm.bio,
        avatar_url: profileForm.avatar_url || null,
        specializations: profileForm.specializations.split(",").map(s => s.trim()).filter(Boolean),
        years_experience: parseInt(profileForm.years_experience) || 0,
        hourly_rate: parseFloat(profileForm.hourly_rate) || 0,
      });
      const slots = daySlots
        .map((s, i) => s.enabled ? { day_of_week: i, start_time: s.start_time, end_time: s.end_time } : null)
        .filter(Boolean);
      await api.patch("/api/mentors/me/slots", { slots });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-mentor-record", user?.id] });
      qc.invalidateQueries({ queryKey: ["my-mentor-slots"] });
      qc.invalidateQueries({ queryKey: ["mentors"] });
      toast({ title: "Profile updated", description: "Your mentor profile has been saved." });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to save profile.", variant: "destructive" });
    },
  });

  const updateSlot = (i: number, field: keyof DaySlot, value: string | boolean) => {
    setDaySlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const pendingBookings = (bookings || []).filter((b: any) => b.status === "pending");
  const upcomingBookings = (bookings || []).filter((b: any) => b.status === "confirmed");
  const pastBookings = (bookings || []).filter((b: any) => ["completed", "cancelled"].includes(b.status));
  const enabledDaysCount = daySlots.filter(s => s.enabled).length;

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

  const BookingCard = ({ booking }: { booking: any }) => (
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

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1">Mentor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your sessions, bookings and profile</p>
        </motion.div>

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
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="pending" className="gap-1 text-xs">
                Pending {pendingBookings.length > 0 && <Badge variant="secondary" className="text-[10px] px-1.5">{pendingBookings.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs">Upcoming</TabsTrigger>
              <TabsTrigger value="past" className="text-xs">Past</TabsTrigger>
              <TabsTrigger value="profile" className="gap-1 text-xs">
                <Pencil size={12} /> My Profile
              </TabsTrigger>
            </TabsList>

            {/* ── Pending ── */}
            <TabsContent value="pending" className="space-y-3">
              {bookingsLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
              ) : pendingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No pending requests</p>
              ) : (
                pendingBookings.map((b: any) => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>

            {/* ── Upcoming ── */}
            <TabsContent value="upcoming" className="space-y-3">
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No upcoming sessions</p>
              ) : (
                upcomingBookings.map((b: any) => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>

            {/* ── Past ── */}
            <TabsContent value="past" className="space-y-3">
              {pastBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No past sessions</p>
              ) : (
                pastBookings.map((b: any) => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>

            {/* ── My Profile ── */}
            <TabsContent value="profile" className="space-y-4">
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  {!mentorRecord.published && (
                    <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
                      <p className="text-xs text-accent font-medium">Your profile is not yet published. An admin will review and publish it so students can find you.</p>
                    </div>
                  )}

                  <Tabs value={profileTab} onValueChange={setProfileTab}>
                    <TabsList className="w-full grid grid-cols-2 mb-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="availability" className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        Availability
                        {enabledDaysCount > 0 && (
                          <span className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{enabledDaysCount}</span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    {/* Details sub-tab */}
                    <TabsContent value="details" className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-sm font-medium text-foreground block mb-1">Full Name *</label>
                          <Input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Your full name" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-sm font-medium text-foreground block mb-1">Professional Title *</label>
                          <Input value={profileForm.title} onChange={e => setProfileForm({ ...profileForm, title: e.target.value })} placeholder="e.g. Senior Business Analyst & PMP Coach" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-sm font-medium text-foreground block mb-1">Bio</label>
                          <Textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={4} placeholder="Tell students about your background and expertise..." />
                        </div>
                        <div className="sm:col-span-2">
                          <CloudinaryUpload
                            value={profileForm.avatar_url}
                            onChange={url => setProfileForm({ ...profileForm, avatar_url: url })}
                            folder="htb-mentors"
                            label="Profile Photo"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-sm font-medium text-foreground block mb-1">Specializations <span className="text-muted-foreground font-normal">(comma separated)</span></label>
                          <Input value={profileForm.specializations} onChange={e => setProfileForm({ ...profileForm, specializations: e.target.value })} placeholder="PMP, Business Analysis, Agile, PRINCE2" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-1">Years of Experience</label>
                          <Input type="number" min="0" value={profileForm.years_experience} onChange={e => setProfileForm({ ...profileForm, years_experience: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-1">Hourly Rate (£)</label>
                          <Input type="number" min="0" value={profileForm.hourly_rate} onChange={e => setProfileForm({ ...profileForm, hourly_rate: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="gap-1.5 flex-1" onClick={() => setProfileTab("availability")}>
                          Set Availability <Calendar size={14} />
                        </Button>
                        <Button
                          onClick={() => saveProfile.mutate()}
                          disabled={saveProfile.isPending || !profileForm.name || !profileForm.title}
                          className="flex-1 gap-1.5"
                        >
                          <Save size={14} /> {saveProfile.isPending ? "Saving..." : "Save Profile"}
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Availability sub-tab */}
                    <TabsContent value="availability" className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Select which days you are available and set your hours for each day.
                      </p>
                      <div className="space-y-2">
                        {DAYS.map((day, i) => (
                          <div
                            key={day}
                            className={`rounded-lg border p-3 transition-colors ${daySlots[i].enabled ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`day-${i}`}
                                checked={daySlots[i].enabled}
                                onChange={e => updateSlot(i, "enabled", e.target.checked)}
                                className="rounded shrink-0"
                              />
                              <label htmlFor={`day-${i}`} className={`text-sm font-medium w-24 cursor-pointer select-none ${daySlots[i].enabled ? "text-foreground" : "text-muted-foreground"}`}>
                                {day}
                              </label>
                              {daySlots[i].enabled ? (
                                <div className="flex items-center gap-2 flex-1 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <label className="text-xs text-muted-foreground shrink-0">From</label>
                                    <Input type="time" value={daySlots[i].start_time} onChange={e => updateSlot(i, "start_time", e.target.value)} className="h-8 text-sm w-32" />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <label className="text-xs text-muted-foreground shrink-0">To</label>
                                    <Input type="time" value={daySlots[i].end_time} onChange={e => updateSlot(i, "end_time", e.target.value)} className="h-8 text-sm w-32" />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Unavailable</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setProfileTab("details")}>
                          Back to Details
                        </Button>
                        <Button
                          onClick={() => saveProfile.mutate()}
                          disabled={saveProfile.isPending || !profileForm.name || !profileForm.title}
                          className="flex-1 gap-1.5"
                        >
                          <Save size={14} /> {saveProfile.isPending ? "Saving..." : "Save Profile"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default MentorDashboard;
