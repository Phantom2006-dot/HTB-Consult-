import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Star, Briefcase, Users, Calendar, Clock,
  Eye, EyeOff, Trash2, CalendarDays, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
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

const statusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px] gap-1"><CheckCircle2 size={9} />Confirmed</Badge>;
    case "cancelled":
      return <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] gap-1"><XCircle size={9} />Cancelled</Badge>;
    case "completed":
      return <Badge className="bg-blue-500/10 text-blue-500 border-0 text-[10px] gap-1"><CheckCircle2 size={9} />Completed</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px] gap-1"><AlertCircle size={9} />Pending</Badge>;
  }
};

const AdminMentorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isNew = id === "new";

  const [form, setForm] = useState({
    name: "",
    title: "",
    bio: "",
    avatar_url: "",
    specializations: "",
    years_experience: "0",
    hourly_rate: "0",
    published: false,
  });
  const [daySlots, setDaySlots] = useState<DaySlot[]>(defaultDaySlots());
  const [dirty, setDirty] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-mentor-detail", id],
    queryFn: () => api.get<any>(`/api/admin/mentors/${id}`),
    enabled: !isNew,
  });

  const { data: existingSlots } = useQuery({
    queryKey: ["admin-mentor-slots", id],
    queryFn: () => api.get<any[]>(`/api/mentors/admin/${id}/slots`),
    enabled: !isNew,
  });

  useEffect(() => {
    if (!data?.mentor) return;
    const m = data.mentor;
    setForm({
      name: m.name || "",
      title: m.title || "",
      bio: m.bio || "",
      avatar_url: m.avatar_url || "",
      specializations: (m.specializations || []).join(", "),
      years_experience: String(m.years_experience || 0),
      hourly_rate: String(m.hourly_rate || 0),
      published: m.published || false,
    });
  }, [data]);

  useEffect(() => {
    if (!existingSlots) return;
    const slots = defaultDaySlots();
    for (const s of existingSlots) {
      slots[s.day_of_week] = {
        enabled: true,
        start_time: s.start_time.slice(0, 5),
        end_time: s.end_time.slice(0, 5),
      };
    }
    setDaySlots(slots);
  }, [existingSlots]);

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const updateSlot = (i: number, field: keyof DaySlot, value: string | boolean) => {
    setDaySlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
    setDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        title: form.title,
        bio: form.bio,
        avatar_url: form.avatar_url || null,
        specializations: form.specializations.split(",").map((t) => t.trim()).filter(Boolean),
        years_experience: parseInt(form.years_experience) || 0,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        published: form.published,
      };

      let mentorId = id;
      if (isNew) {
        const created = await api.post<any>("/api/mentors/admin", payload);
        mentorId = created.id;
      } else {
        await api.patch(`/api/mentors/admin/${id}`, payload);
      }

      const slots = daySlots
        .map((s, i) => s.enabled ? { day_of_week: i, start_time: s.start_time, end_time: s.end_time } : null)
        .filter(Boolean);
      await api.patch(`/api/mentors/admin/${mentorId}/slots`, { slots });

      return mentorId;
    },
    onSuccess: (mentorId) => {
      qc.invalidateQueries({ queryKey: ["admin-mentors"] });
      qc.invalidateQueries({ queryKey: ["admin-mentor-detail", id] });
      qc.invalidateQueries({ queryKey: ["mentors"] });
      setDirty(false);
      toast({ title: isNew ? "Mentor created" : "Changes saved" });
      if (isNew) navigate(`/admin/mentors/${mentorId}`, { replace: true });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to save.", variant: "destructive" });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: (published: boolean) => api.patch(`/api/mentors/admin/${id}`, { published }),
    onSuccess: (_data, published) => {
      qc.invalidateQueries({ queryKey: ["admin-mentor-detail", id] });
      qc.invalidateQueries({ queryKey: ["admin-mentors"] });
      setForm((prev) => ({ ...prev, published }));
      toast({ title: published ? "Mentor published" : "Mentor unpublished" });
    },
  });

  const mentor = data?.mentor;
  const bookings = data?.bookings ?? [];
  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (!isNew && isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/mentors")} className="gap-1.5 text-muted-foreground">
              <ArrowLeft size={15} /> Mentors
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">
                {isNew ? "New Mentor" : (mentor?.name || "Edit Mentor")}
              </h1>
              {!isNew && mentor && (
                <p className="text-sm text-muted-foreground">{mentor.title}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isNew && mentor && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => togglePublishMutation.mutate(!mentor.published)}
                disabled={togglePublishMutation.isPending}
              >
                {mentor.published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || (!dirty && !isNew) || !form.name || !form.title}
              className="gap-1.5"
            >
              <Save size={14} />
              {saveMutation.isPending ? "Saving…" : dirty ? "Save Changes" : "Saved"}
            </Button>
          </div>
        </motion.div>

        {/* Profile Summary Card (existing mentors only) */}
        {!isNew && mentor && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card className="border-border bg-card">
              <CardContent className="p-5 flex items-center gap-5">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt={mentor.name} className="w-16 h-16 rounded-full object-cover shrink-0 ring-2 ring-border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-bold shrink-0 ring-2 ring-border">
                    {getInitials(mentor.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-foreground">{mentor.name}</h2>
                    {mentor.published
                      ? <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px]">Live</Badge>
                      : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{mentor.title}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Star size={13} className="text-amber-500" /> {parseFloat(mentor.rating || 0).toFixed(1)} rating</span>
                    <span className="flex items-center gap-1"><Briefcase size={13} /> {mentor.years_experience} yrs exp</span>
                    <span className="flex items-center gap-1"><Users size={13} /> {mentor.total_sessions} sessions</span>
                    <span className="flex items-center gap-1 font-medium text-foreground">£{mentor.hourly_rate}/hr</span>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(mentor.created_at), "d MMM yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Tabs defaultValue="details">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="availability" className="gap-1.5">
                <Calendar size={13} /> Availability
              </TabsTrigger>
              {!isNew && (
                <TabsTrigger value="bookings" className="gap-1.5">
                  <CalendarDays size={13} /> Bookings ({bookings.length})
                </TabsTrigger>
              )}
              {isNew && <TabsTrigger value="bookings" disabled>Bookings</TabsTrigger>}
            </TabsList>

            {/* ── Details ── */}
            <TabsContent value="details" className="mt-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium mb-1.5 block">Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="e.g. Sarah Johnson"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium mb-1.5 block">Professional Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder="e.g. Senior Business Analyst & PMP Coach"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium mb-1.5 block">Bio</Label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => updateForm("bio", e.target.value)}
                    rows={4}
                    placeholder="Brief professional background, expertise and what students can expect from sessions…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <CloudinaryUpload
                    value={form.avatar_url}
                    onChange={(url) => updateForm("avatar_url", url)}
                    folder="htb-mentors"
                    label="Profile Photo"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium mb-1.5 block">
                    Specializations <span className="text-muted-foreground font-normal">(comma separated)</span>
                  </Label>
                  <Input
                    value={form.specializations}
                    onChange={(e) => updateForm("specializations", e.target.value)}
                    placeholder="PMP, Business Analysis, Agile, PRINCE2, CBAP"
                  />
                  {form.specializations && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {form.specializations.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.years_experience}
                    onChange={(e) => updateForm("years_experience", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Hourly Rate (£)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="5"
                    value={form.hourly_rate}
                    onChange={(e) => updateForm("hourly_rate", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3 pt-1 p-4 rounded-lg border border-border bg-muted/20">
                  <Switch
                    id="published"
                    checked={form.published}
                    onCheckedChange={(v) => updateForm("published", v)}
                  />
                  <div>
                    <Label htmlFor="published" className="text-sm font-medium cursor-pointer">
                      {form.published ? "Published — visible to students" : "Draft — hidden from students"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {form.published
                        ? "This mentor profile is live and students can browse and book sessions."
                        : "This mentor profile is hidden. Toggle to make it visible on the platform."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || (!dirty && !isNew) || !form.name || !form.title}
                  className="gap-1.5 min-w-32"
                >
                  <Save size={14} />
                  {saveMutation.isPending ? "Saving…" : isNew ? "Create Mentor" : "Save Changes"}
                </Button>
              </div>
            </TabsContent>

            {/* ── Availability ── */}
            <TabsContent value="availability" className="mt-5 space-y-4">
              <div className="p-4 rounded-lg border border-border bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Set which days this mentor is available and their working hours per day. Students will only be able to book sessions on days marked as available.
                </p>
              </div>
              <div className="space-y-2">
                {DAYS.map((day, i) => (
                  <div
                    key={day}
                    className={`rounded-lg border p-3.5 transition-colors ${daySlots[i].enabled ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        id={`day-${i}`}
                        checked={daySlots[i].enabled}
                        onCheckedChange={(v) => updateSlot(i, "enabled", v)}
                      />
                      <Label
                        htmlFor={`day-${i}`}
                        className={`text-sm font-medium w-24 cursor-pointer select-none ${daySlots[i].enabled ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {day}
                      </Label>
                      {daySlots[i].enabled ? (
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">From</span>
                            <Input
                              type="time"
                              value={daySlots[i].start_time}
                              onChange={(e) => updateSlot(i, "start_time", e.target.value)}
                              className="h-8 text-sm w-32"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">To</span>
                            <Input
                              type="time"
                              value={daySlots[i].end_time}
                              onChange={(e) => updateSlot(i, "end_time", e.target.value)}
                              className="h-8 text-sm w-32"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !form.name || !form.title}
                  className="gap-1.5 min-w-32"
                >
                  <Save size={14} />
                  {saveMutation.isPending ? "Saving…" : "Save Availability"}
                </Button>
              </div>
            </TabsContent>

            {/* ── Bookings ── */}
            <TabsContent value="bookings" className="mt-5">
              {bookings.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="p-10 text-center">
                    <CalendarDays size={32} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No bookings yet for this mentor.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b: any) => (
                    <Card key={b.id} className="border-border bg-card">
                      <CardContent className="p-4 flex items-center gap-4">
                        {b.student_avatar ? (
                          <img src={b.student_avatar} alt={b.student_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                            {(b.student_name || b.student_email || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{b.student_name || "Unknown Student"}</p>
                          <p className="text-xs text-muted-foreground truncate">{b.student_email}</p>
                        </div>
                        <div className="shrink-0 text-right space-y-1">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar size={11} />
                              {format(new Date(b.session_date), "d MMM yyyy")}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock size={11} />
                              {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}
                            </span>
                          </div>
                          <div className="flex justify-end">
                            {statusBadge(b.status)}
                          </div>
                        </div>
                      </CardContent>
                      {b.notes && (
                        <div className="px-4 pb-3">
                          <p className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2 italic">"{b.notes}"</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminMentorDetail;
