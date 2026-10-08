import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, CalendarDays, Briefcase, Users, Check, ArrowLeft
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
import { breadcrumbSchema, makePageTitle, SITE_ORIGIN, setSeoMetadata } from "@/lib/seo";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useMentorDetail(id);
  const createBooking = useCreateBooking();

  useEffect(() => {
    if (!data?.mentor) return;
    const mentor = data.mentor;
    const pathname = `/mentor/${encodeURIComponent(String(mentor.id || id || ""))}`;
    const canonical = `${SITE_ORIGIN}${pathname}`;
    const description = String(mentor.bio || `${mentor.name}${mentor.title ? ` — ${mentor.title}` : ""} is an HTB Consult Academy industry mentor.`)
      .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
    const image = mentor.avatar_url && /^https?:\/\//i.test(mentor.avatar_url) ? mentor.avatar_url : undefined;
    setSeoMetadata({
      title: makePageTitle(`${mentor.name} | Academy Mentor`),
      description,
      pathname,
      image,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: SITE_ORIGIN },
          { name: "Mentors", url: `${SITE_ORIGIN}/mentors` },
          { name: mentor.name, url: canonical },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: mentor.name,
            identifier: String(mentor.id),
            ...(mentor.title ? { jobTitle: mentor.title } : {}),
            description,
            url: canonical,
            ...(image ? { image } : {}),
            worksFor: { "@type": "Organization", name: "HTB Consult Academy", url: SITE_ORIGIN },
          },
        },
      ],
    });
  }, [data, id]);

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
          {/* Loading skeleton — stacks on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Skeleton className="w-20 h-20 rounded-full shrink-0 mx-auto sm:mx-0" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
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
        <div className="px-4 lg:px-8 py-20 max-w-5xl mx-auto text-center">
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

  const selectedDayName = selectedDate ? dayNames[selectedDate.getDay()] : null;
  const availableSlotsForDay = selectedDayName ? (slotsByDay[selectedDayName] || []) : [];
  const availableDayNumbers = slots.map(s => s.day_of_week);
  const isDateAvailable = (date: Date) => {
    if (date < new Date(new Date().toDateString())) return false;
    return availableDayNumbers.includes(date.getDay());
  };
  const availableDayNames = [...new Set(slots.map(s => dayNames[s.day_of_week]))];

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">

        {/* Back link */}
        <button
          onClick={() => navigate("/mentors")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} /> Back to Mentors
        </button>

        {/* ── Header: avatar + info + session card ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: avatar + bio summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Avatar row — stacks cleanly on mobile */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              {mentor.avatar_url ? (
                <img
                  src={mentor.avatar_url}
                  alt={mentor.name}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-20 h-20 rounded-full object-cover shrink-0 ring-2 ring-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold shrink-0 ring-2 ring-border">
                  {getInitials(mentor.name)}
                </div>
              )}
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground">{mentor.name}</h1>
                <p className="text-sm text-muted-foreground">{mentor.title}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    {parseFloat(mentor.rating || "0").toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} />
                    {mentor.years_experience} yrs exp
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    {mentor.total_sessions} sessions
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Session info card */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Session Info</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly rate</span>
                  <span className="text-foreground font-semibold text-base">£{mentor.hourly_rate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="text-foreground font-medium flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    {parseFloat(mentor.rating || "0").toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions done</span>
                  <span className="text-foreground font-medium">{mentor.total_sessions}</span>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Available days</p>
                  <p className="text-foreground font-medium text-xs">
                    {availableDayNames.length > 0 ? availableDayNames.join(", ") : "Contact for availability"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── About ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          <h2 className="text-base sm:text-lg font-serif font-bold text-foreground">About</h2>
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

        {/* ── Booking Section ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-5">
          <h2 className="text-base sm:text-lg font-serif font-bold text-foreground flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" /> Book a Session
          </h2>

          {bookingStep === "done" ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5 sm:p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h3 className="font-semibold text-foreground">Session Booked!</h3>
                <p className="text-sm text-muted-foreground">
                  Your session with {mentor.name} on {selectedDate && format(selectedDate, "MMM d, yyyy")} at {selectedSlot?.start.slice(0, 5)} has been confirmed.
                  The mentor will be notified.
                </p>
                <Button variant="outline" onClick={() => {
                  setBookingStep("select");
                  setSelectedDate(undefined);
                  setSelectedSlot(null);
                  setNotes("");
                }}>
                  Book Another Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Calendar */}
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-foreground mb-3">1. Pick a date</h3>
                  {/* Calendar centered on mobile */}
                  <div className="flex justify-center lg:justify-start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                        setBookingStep("select");
                      }}
                      disabled={(date) => !isDateAvailable(date)}
                      className="rounded-md w-full max-w-[320px] lg:max-w-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots + Confirm */}
              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-foreground">2. Choose a time slot</h3>
                    {!selectedDate ? (
                      <p className="text-xs text-muted-foreground italic">Select a date first</p>
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
                            {slot.start.slice(0, 5)} – {slot.end.slice(0, 5)}
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
                        <p>Time: <span className="text-foreground">{selectedSlot.start.slice(0, 5)} – {selectedSlot.end.slice(0, 5)}</span></p>
                        <p>Mentor: <span className="text-foreground">{mentor.name}</span></p>
                      </div>
                      <Textarea
                        placeholder="Add any notes for the mentor (optional)…"
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
                        {createBooking.isPending ? "Booking…" : "Confirm Booking"}
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
