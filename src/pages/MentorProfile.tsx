import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, CalendarDays, Briefcase, Users, MessageSquare, Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useMentorDetail } from "@/hooks/use-mentors";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useMentorDetail(id);
  const createBooking = useCreateBooking();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [bookingStep, setBookingStep] = useState<"select" | "confirm" | "done">("select");

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleBook = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to book a session.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!selectedDate || !selectedSlot || !id) return;

    try {
      await createBooking.mutateAsync({
        mentor_id: id,
        student_id: user.id,
        session_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        notes: notes || undefined,
      });
      setBookingStep("done");
      toast({ title: "Session booked!", description: `Your session is scheduled for ${format(selectedDate, "MMM d, yyyy")} at ${selectedSlot.start.slice(0, 5)}.` });
    } catch (e: any) {
      toast({ title: "Booking failed", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
          <div className="flex gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!data) {
    return (
      <SidebarLayout>
        <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto text-center py-20">
          <h1 className="text-xl font-bold text-foreground mb-2">Mentor not found</h1>
          <Button onClick={() => navigate("/mentors")}>Browse Mentors</Button>
        </div>
      </SidebarLayout>
    );
  }

  const { mentor, slots } = data;

  const slotsByDay = slots.reduce((acc, s) => {
    const day = dayNames[s.day_of_week];
    if (!acc[day]) acc[day] = [];
    acc[day].push({ start: s.start_time, end: s.end_time });
    return acc;
  }, {} as Record<string, { start: string; end: string }[]>);

  // Get available slots for the selected date
  const selectedDayName = selectedDate ? dayNames[selectedDate.getDay()] : null;
  const availableSlotsForDay = selectedDayName ? (slotsByDay[selectedDayName] || []) : [];

  // Only allow dates that have availability
  const availableDayNumbers = slots.map(s => s.day_of_week);
  const isDateAvailable = (date: Date) => {
    if (date < new Date(new Date().toDateString())) return false;
    return availableDayNumbers.includes(date.getDay());
  };

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold shrink-0">
                {getInitials(mentor.name)}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-serif font-bold text-foreground">{mentor.name}</h1>
                <p className="text-sm text-muted-foreground">{mentor.title}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Star size={14} className="text-primary fill-primary" /> {mentor.rating}</span>
                  <span className="flex items-center gap-1"><Briefcase size={14} /> {mentor.years_experience} years</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {mentor.total_sessions} sessions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Session Info</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Rate: <span className="text-foreground font-medium">£{mentor.hourly_rate}/hr</span></p>
                <p>Available: <span className="text-foreground font-medium">{Object.keys(slotsByDay).join(", ") || "No slots"}</span></p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-foreground">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{mentor.bio}</p>
          <Separator />
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-2">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.specializations.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>
        </motion.div>

        <Separator />

        {/* Booking Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-6">
          <h2 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
            <CalendarDays size={20} className="text-primary" /> Book a Session
          </h2>

          {bookingStep === "done" ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h3 className="font-semibold text-foreground">Session Booked!</h3>
                <p className="text-sm text-muted-foreground">
                  Your session with {mentor.name} on {selectedDate && format(selectedDate, "MMM d, yyyy")} at {selectedSlot?.start.slice(0, 5)} has been confirmed.
                  The mentor will be notified.
                </p>
                <Button variant="outline" onClick={() => { setBookingStep("select"); setSelectedDate(undefined); setSelectedSlot(null); setNotes(""); }}>
                  Book Another Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-foreground mb-3">1. Pick a date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => { setSelectedDate(date); setSelectedSlot(null); setBookingStep("select"); }}
                    disabled={(date) => !isDateAvailable(date)}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>

              {/* Time Slots + Confirm */}
              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-foreground">2. Choose a time slot</h3>
                    {!selectedDate ? (
                      <p className="text-xs text-muted-foreground">Select a date first</p>
                    ) : availableSlotsForDay.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No slots available on this day</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableSlotsForDay.map((slot) => (
                          <Button
                            key={slot.start}
                            size="sm"
                            variant={selectedSlot?.start === slot.start ? "default" : "outline"}
                            onClick={() => { setSelectedSlot(slot); setBookingStep("confirm"); }}
                          >
                            {slot.start.slice(0, 5)} - {slot.end.slice(0, 5)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {bookingStep === "confirm" && selectedSlot && selectedDate && (
                  <Card className="border-primary/30 bg-card">
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm text-foreground">3. Confirm booking</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Date: <span className="text-foreground">{format(selectedDate, "EEEE, MMM d, yyyy")}</span></p>
                        <p>Time: <span className="text-foreground">{selectedSlot.start.slice(0, 5)} - {selectedSlot.end.slice(0, 5)}</span></p>
                        <p>Mentor: <span className="text-foreground">{mentor.name}</span></p>
                      </div>
                      <Textarea
                        placeholder="Add any notes for the mentor (optional)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm"
                        rows={3}
                      />
                      <Button
                        className="w-full"
                        onClick={handleBook}
                        disabled={createBooking.isPending}
                      >
                        {createBooking.isPending ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default MentorProfile;
