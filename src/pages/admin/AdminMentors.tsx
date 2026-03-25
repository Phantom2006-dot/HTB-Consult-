import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface MentorForm {
  name: string;
  title: string;
  bio: string;
  avatar_url: string;
  specializations: string;
  years_experience: string;
  hourly_rate: string;
  published: boolean;
}

interface DaySlot {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

const emptyMentor: MentorForm = {
  name: "", title: "", bio: "", avatar_url: "",
  specializations: "", years_experience: "0", hourly_rate: "0", published: false,
};

const defaultDaySlots = (): DaySlot[] =>
  DAYS.map((_, i) => ({
    enabled: i >= 1 && i <= 5,
    start_time: "09:00",
    end_time: "17:00",
  }));

const AdminMentors = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<MentorForm>(emptyMentor);
  const [daySlots, setDaySlots] = useState<DaySlot[]>(defaultDaySlots());
  const [activeTab, setActiveTab] = useState("details");

  const { data: mentors, isLoading } = useQuery({
    queryKey: ["admin-mentors"],
    queryFn: () => api.get<any[]>("/api/admin/mentors"),
  });

  const { data: existingSlots } = useQuery({
    queryKey: ["admin-mentor-slots", editing],
    queryFn: () => api.get<any[]>(`/api/mentors/admin/${editing}/slots`),
    enabled: !!editing,
  });

  useEffect(() => {
    if (!editing || !existingSlots) return;
    const slots = defaultDaySlots();
    for (const s of existingSlots) {
      slots[s.day_of_week] = {
        enabled: true,
        start_time: s.start_time.slice(0, 5),
        end_time: s.end_time.slice(0, 5),
      };
    }
    setDaySlots(slots);
  }, [existingSlots, editing]);

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
      let mentorId = editing;
      if (editing) {
        await api.patch(`/api/mentors/admin/${editing}`, payload);
      } else {
        const created = await api.post<any>("/api/mentors/admin", payload);
        mentorId = created.id;
      }
      const slots = daySlots
        .map((s, i) => s.enabled ? { day_of_week: i, start_time: s.start_time, end_time: s.end_time } : null)
        .filter(Boolean);
      await api.patch(`/api/mentors/admin/${mentorId}/slots`, { slots });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mentors"] });
      qc.invalidateQueries({ queryKey: ["mentors"] });
      setOpen(false);
      setEditing(null);
      setForm(emptyMentor);
      setDaySlots(defaultDaySlots());
      setActiveTab("details");
      toast({ title: editing ? "Mentor updated" : "Mentor created" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to save mentor.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/mentors/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mentors"] });
      toast({ title: "Mentor deleted" });
    },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/api/mentors/admin/${id}`, { published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-mentors"] }),
  });

  const openEdit = (mentor: any) => {
    setEditing(mentor.id);
    setForm({
      name: mentor.name,
      title: mentor.title,
      bio: mentor.bio || "",
      avatar_url: mentor.avatar_url || "",
      specializations: (mentor.specializations || []).join(", "),
      years_experience: String(mentor.years_experience),
      hourly_rate: String(mentor.hourly_rate),
      published: mentor.published,
    });
    setDaySlots(defaultDaySlots());
    setActiveTab("details");
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyMentor);
    setDaySlots(defaultDaySlots());
    setActiveTab("details");
    setOpen(true);
  };

  const updateSlot = (i: number, field: keyof DaySlot, value: string | boolean) => {
    setDaySlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const enabledDaysCount = daySlots.filter((s) => s.enabled).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Mentors</h1>
            <p className="text-sm text-muted-foreground">{(mentors || []).length} total mentors</p>
          </div>
          <Button onClick={openCreate} className="gap-1.5"><Plus size={16} /> New Mentor</Button>
        </motion.div>

        {/* Mentor list */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
          ) : (mentors || []).length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">No mentors yet. Add your first mentor!</CardContent>
            </Card>
          ) : (
            (mentors || []).map((mentor: any) => (
              <Card key={mentor.id} className="border-border bg-card hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  {mentor.avatar_url ? (
                    <img src={mentor.avatar_url} alt={mentor.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitials(mentor.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">{mentor.name}</h3>
                      {mentor.published
                        ? <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px]">Published</Badge>
                        : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{mentor.title}</span>
                      <span>{mentor.years_experience} yrs exp</span>
                      <span>£{mentor.hourly_rate}/hr</span>
                      <span>{mentor.total_sessions} sessions</span>
                    </div>
                    {(mentor.specializations || []).length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {mentor.specializations.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{s}</span>
                        ))}
                        {mentor.specializations.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{mentor.specializations.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="icon" variant="ghost" className="h-8 w-8"
                      onClick={() => togglePublish.mutate({ id: mentor.id, published: !mentor.published })}>
                      {mentor.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(mentor)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                      onClick={() => deleteMutation.mutate(mentor.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setActiveTab("details"); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Mentor" : "New Mentor"}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center gap-1.5">
                <Calendar size={13} />
                Availability
                {enabledDaysCount > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{enabledDaysCount}</span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Details tab ── */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-1">Full Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sarah Johnson" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-1">Professional Title *</label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Business Analyst & PMP Coach" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-1">Bio</label>
                  <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Brief professional background..." />
                </div>
                <div className="sm:col-span-2">
                  <CloudinaryUpload
                    value={form.avatar_url}
                    onChange={(url) => setForm({ ...form, avatar_url: url })}
                    folder="htb-mentors"
                    label="Profile Photo"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-1">Specializations <span className="text-muted-foreground font-normal">(comma separated)</span></label>
                  <Input value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} placeholder="PMP, Business Analysis, Agile, PRINCE2" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Years of Experience</label>
                  <Input type="number" min="0" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Hourly Rate (£)</label>
                  <Input type="number" min="0" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="published" checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
                <label htmlFor="published" className="text-sm text-foreground">Published — visible to students</label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="gap-1.5 flex-1" onClick={() => setActiveTab("availability")}>
                  Set Availability <ChevronRight size={14} />
                </Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name || !form.title} className="flex-1">
                  {saveMutation.isPending ? "Saving..." : editing ? "Update Mentor" : "Create Mentor"}
                </Button>
              </div>
            </TabsContent>

            {/* ── Availability tab ── */}
            <TabsContent value="availability" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Select which days the mentor is available and set their hours for each day.
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
                        onChange={(e) => updateSlot(i, "enabled", e.target.checked)}
                        className="rounded shrink-0"
                      />
                      <label htmlFor={`day-${i}`} className={`text-sm font-medium w-24 cursor-pointer select-none ${daySlots[i].enabled ? "text-foreground" : "text-muted-foreground"}`}>
                        {day}
                      </label>
                      {daySlots[i].enabled ? (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs text-muted-foreground shrink-0">From</label>
                            <Input
                              type="time"
                              value={daySlots[i].start_time}
                              onChange={(e) => updateSlot(i, "start_time", e.target.value)}
                              className="h-8 text-sm w-32"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs text-muted-foreground shrink-0">To</label>
                            <Input
                              type="time"
                              value={daySlots[i].end_time}
                              onChange={(e) => updateSlot(i, "end_time", e.target.value)}
                              className="h-8 text-sm w-32"
                            />
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
                <Button variant="outline" className="flex-1" onClick={() => setActiveTab("details")}>
                  Back to Details
                </Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name || !form.title} className="flex-1">
                  {saveMutation.isPending ? "Saving..." : editing ? "Update Mentor" : "Create Mentor"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMentors;
