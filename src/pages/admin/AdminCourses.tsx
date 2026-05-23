import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, Presentation, Lock, LockOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCategories } from "@/hooks/use-categories";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

interface CourseForm {
  title: string;
  short_description: string;
  description: string;
  category: string;
  skill_level: string;
  course_type: string;
  price: string;
  total_duration: string;
  next_batch_date: string;
  schedule: string;
  certificate_name: string;
  whats_included: string;
  tags: string;
  thumbnail_url: string;
  live_class_url: string;
  published: boolean;
}

const emptyCourse: CourseForm = {
  title: "", short_description: "", description: "",
  category: "Business Analysis", skill_level: "Beginner", course_type: "live",
  price: "0", total_duration: "", next_batch_date: "", schedule: "",
  certificate_name: "Certificate of Completion",
  whats_included: "Live interactive sessions\nIndustry case studies & datasets\nBA tools, templates & frameworks\nSimulation exercises\nExpert feedback & guidance\nCommunity access\nCertificate of completion",
  tags: "", thumbnail_url: "", live_class_url: "", published: false,
};

const AdminCourses = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: categoriesData } = useCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyCourse);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get<any[]>("/api/admin/courses"),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        short_description: form.short_description,
        description: form.description,
        category: form.category,
        skill_level: form.skill_level,
        course_type: form.course_type,
        price: parseFloat(form.price) || 0,
        total_duration: form.total_duration,
        next_batch_date: form.next_batch_date,
        schedule: form.schedule,
        certificate_name: form.certificate_name,
        whats_included: form.whats_included.split("\n").map((t) => t.trim()).filter(Boolean),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        thumbnail_url: form.thumbnail_url || null,
        live_class_url: form.live_class_url || null,
        published: form.published,
      };
      if (editing) {
        await api.patch(`/api/admin/courses/${editing}`, payload);
      } else {
        await api.post("/api/admin/courses", payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      setOpen(false);
      setEditing(null);
      setForm(emptyCourse);
      setShowAdvanced(false);
      toast({ title: editing ? "Course updated" : "Course created" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save course.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/courses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course deleted" });
    },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/api/admin/courses/${id}`, { published }),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["admin-courses"] });
      qc.refetchQueries({ queryKey: ["courses"] });
    },
  });

  const toggleLock = useMutation({
    mutationFn: ({ id, is_locked }: { id: string; is_locked: boolean }) =>
      api.patch(`/api/admin/courses/${id}/lock`, { is_locked }),
    onSuccess: (_data, { is_locked }) => {
      qc.refetchQueries({ queryKey: ["admin-courses"] });
      qc.refetchQueries({ queryKey: ["courses"] });
      toast({
        title: is_locked ? "Course locked" : "Course unlocked",
        description: is_locked ? "Students will see a locked notice." : "Students can access this course again.",
      });
    },
    onError: () => toast({ title: "Error", description: "Failed to update lock status.", variant: "destructive" }),
  });

  const openEdit = (course: any) => {
    setEditing(course.id);
    setForm({
      title: course.title,
      short_description: course.short_description || "",
      description: course.description,
      category: course.category,
      skill_level: course.skill_level,
      course_type: course.course_type || "live",
      price: String(course.price),
      total_duration: course.total_duration || "",
      next_batch_date: course.next_batch_date || "",
      schedule: course.schedule || "",
      certificate_name: course.certificate_name || "Certificate of Completion",
      whats_included: (course.whats_included || []).join("\n"),
      tags: (course.tags || []).join(", "),
      thumbnail_url: course.thumbnail_url || "",
      live_class_url: course.live_class_url || "",
      published: course.published,
    });
    setShowAdvanced(false);
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCourse);
    setShowAdvanced(false);
    setOpen(true);
  };

  const f = (key: keyof CourseForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Courses</h1>
            <p className="text-sm text-muted-foreground">{(courses || []).length} total courses</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gap-1.5"><Plus size={16} /> New Course</Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Course" : "Create Course"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-2">

                {/* ── Core Info ─────────────────────────────── */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Core Info</p>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Title *</label>
                    <Input value={form.title} onChange={f("title")} placeholder="e.g. Practical BA Application & Simulation" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Short Description <span className="text-muted-foreground font-normal">(shown below title on course page)</span></label>
                    <Input value={form.short_description} onChange={f("short_description")} placeholder="e.g. Apply your knowledge through hands-on exercises and real-world simulations." />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Full Description</label>
                    <Textarea value={form.description} onChange={f("description")} rows={3} placeholder="Detailed course description shown in About This Course section." />
                  </div>
                </div>

                <Separator />

                {/* ── Type, Level & Delivery ─────────────────── */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type & Delivery</p>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Course Type</label>
                    <Select value={form.course_type} onValueChange={(v) => setForm({ ...form, course_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">📹 Video Course</SelectItem>
                        <SelectItem value="live">🔴 Live Class</SelectItem>
                        <SelectItem value="book">📚 Book / Resource</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Category</label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(categoriesData || []).map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Skill Level</label>
                      <Select value={form.skill_level} onValueChange={(v) => setForm({ ...form, skill_level: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Price (£)</label>
                      <Input type="number" value={form.price} onChange={f("price")} placeholder="2990" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Duration</label>
                      <Input value={form.total_duration} onChange={f("total_duration")} placeholder="e.g. 6 Weeks" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ── Sidebar Info (shown on course page sidebar) ── */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sidebar Details <span className="text-muted-foreground font-normal normal-case tracking-normal">(shown in the course info panel)</span></p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Next Batch Date</label>
                      <Input value={form.next_batch_date} onChange={f("next_batch_date")} placeholder="e.g. 27 May 2025" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Certificate Name</label>
                      <Input value={form.certificate_name} onChange={f("certificate_name")} placeholder="Certificate of Completion" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Schedule</label>
                    <Input value={form.schedule} onChange={f("schedule")} placeholder="e.g. Tues & Thu, 7:00 PM – 9:00 PM (SAST)" />
                  </div>
                </div>

                <Separator />

                {/* ── What's Included ──────────────────────── */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What's Included <span className="text-muted-foreground font-normal normal-case tracking-normal">(one item per line)</span></p>
                  <Textarea
                    value={form.whats_included}
                    onChange={f("whats_included")}
                    rows={6}
                    placeholder={"Live interactive sessions\nIndustry case studies & datasets\nBA tools, templates & frameworks\nSimulation exercises\nExpert feedback & guidance\nCommunity access\nCertificate of completion"}
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Each line becomes a bullet point in the "What's Included" sidebar section.</p>
                </div>

                <Separator />

                {/* ── Advanced (collapsible) ────────────────── */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    Advanced Options
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1">Tags <span className="text-muted-foreground font-normal">(comma separated)</span></label>
                        <Input value={form.tags} onChange={f("tags")} placeholder="Business Analysis, Requirements, BPMN" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1">
                          {form.course_type === "live" ? "Live Class Link" : form.course_type === "book" ? "Book / Resource Link" : "Video Link (optional)"}
                        </label>
                        <Input
                          value={form.live_class_url}
                          onChange={f("live_class_url")}
                          placeholder={
                            form.course_type === "live" ? "https://meet.google.com/abc-defg-hij"
                            : form.course_type === "book" ? "https://example.com/book-link"
                            : "https://example.com/video"
                          }
                        />
                      </div>

                      <CloudinaryUpload
                        value={form.thumbnail_url}
                        onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                        folder="htb-courses"
                        label="Thumbnail Image"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* ── Publish + Save ───────────────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border">
                    <input
                      type="checkbox"
                      id="published"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <label htmlFor="published" className="text-sm text-foreground">
                      Published — visible to students on the Courses page
                    </label>
                  </div>

                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending || !form.title}
                    className="w-full bg-gradient-gold hover:opacity-90 font-semibold"
                    size="lg"
                  >
                    {saveMutation.isPending ? "Saving..." : editing ? "Update Course" : "Create Course"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* ── Course List ─────────────────────────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
          ) : (courses || []).length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">No courses yet. Create your first course!</CardContent>
            </Card>
          ) : (
            (courses || []).map((course: any) => (
              <Card key={course.id} className="border-border bg-card hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Thumbnail */}
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-14 h-10 rounded object-cover shrink-0 border border-border" />
                  ) : (
                    <div className="w-14 h-10 rounded bg-muted/50 border border-border shrink-0 flex items-center justify-center text-muted-foreground/40 text-xs">No img</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground truncate">{course.title}</h3>
                      {course.published ? (
                        <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px]">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                      )}
                      {course.is_locked && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 text-[10px]">Locked</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        {course.course_type === "live" ? "🔴 Live" : course.course_type === "book" ? "📚 Book" : "📹 Video"}
                      </Badge>
                      <span>{course.category}</span>
                      <span>{course.skill_level}</span>
                      {course.total_duration && <span>{course.total_duration}</span>}
                      {course.next_batch_date && <span>Next: {course.next_batch_date}</span>}
                      <span>{course.price > 0 ? `£${Number(course.price).toLocaleString()}` : "Free"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8"
                      title={course.published ? "Unpublish" : "Publish"}
                      onClick={() => togglePublish.mutate({ id: course.id, published: !course.published })}
                    >
                      {course.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      title={course.is_locked ? "Unlock course" : "Lock course"}
                      className={`h-8 w-8 ${course.is_locked ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"}`}
                      onClick={() => toggleLock.mutate({ id: course.id, is_locked: !course.is_locked })}
                    >
                      {course.is_locked ? <Lock size={14} /> : <LockOpen size={14} />}
                    </Button>
                    <Link to={`/admin/courses/${course.id}/resources`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" title="Manage resources">
                        <Presentation size={14} />
                      </Button>
                    </Link>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(course)} title="Edit course">
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      title="Delete course"
                      onClick={() => {
                        if (confirm(`Delete "${course.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate(course.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminCourses;
