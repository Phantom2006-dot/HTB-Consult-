import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Presentation, Lock, LockOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  description: string;
  category: string;
  skill_level: string;
  course_type: string;
  price: string;
  total_duration: string;
  tags: string;
  thumbnail_url: string;
  live_class_url: string;
  published: boolean;
}

const emptyCourse: CourseForm = {
  title: "", description: "", category: "Business Analysis",
  skill_level: "Beginner", course_type: "video", price: "0", total_duration: "", tags: "", thumbnail_url: "", live_class_url: "", published: false,
};

const AdminCourses = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: categoriesData } = useCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyCourse);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get<any[]>("/api/admin/courses"),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        skill_level: form.skill_level,
        course_type: form.course_type,
        price: parseFloat(form.price) || 0,
        total_duration: form.total_duration,
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
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const toggleLock = useMutation({
    mutationFn: ({ id, is_locked }: { id: string; is_locked: boolean }) =>
      api.patch(`/api/admin/courses/${id}/lock`, { is_locked }),
    onSuccess: (_data, { is_locked }) => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: is_locked ? "Course locked" : "Course unlocked", description: is_locked ? "Students will see a locked notice." : "Students can access this course again." });
    },
    onError: () => toast({ title: "Error", description: "Failed to update lock status.", variant: "destructive" }),
  });

  const openEdit = (course: any) => {
    setEditing(course.id);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      skill_level: course.skill_level,
      course_type: course.course_type || "video",
      price: String(course.price),
      total_duration: course.total_duration || "",
      tags: (course.tags || []).join(", "),
      thumbnail_url: course.thumbnail_url || "",
      live_class_url: course.live_class_url || "",
      published: course.published,
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCourse);
    setOpen(true);
  };

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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Course" : "Create Course"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Title</label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Course title" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Description</label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Course description" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Course Type</label>
                  <Select value={form.course_type} onValueChange={(v) => setForm({ ...form, course_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">📹 Video Course</SelectItem>
                      <SelectItem value="live">🔴 Live Class</SelectItem>
                      <SelectItem value="book">📚 Book</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {form.course_type === "live" ? "Students will join via an external meeting link" : form.course_type === "book" ? "Students will access an external book/resource link" : "Students will watch pre-recorded video lessons"}
                  </p>
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
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Duration</label>
                    <Input value={form.total_duration} onChange={(e) => setForm({ ...form, total_duration: e.target.value })} placeholder="e.g. 40 hours" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Tags (comma separated)</label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="PRINCE2, PMP, Agile" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    {form.course_type === "live" ? "Live Class Link *" : form.course_type === "book" ? "Book / Resource Link *" : "Video / Resource Link (optional)"}
                  </label>
                  <Input
                    value={form.live_class_url}
                    onChange={(e) => setForm({ ...form, live_class_url: e.target.value })}
                    placeholder={form.course_type === "live" ? "https://meet.google.com/abc-defg-hij" : form.course_type === "book" ? "https://example.com/book-link" : "https://example.com/video-link"}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {form.course_type === "live" ? "Google Meet, Zoom, or any external class link" : form.course_type === "book" ? "Link to the book, PDF, or reading resource" : "External video platform link (optional)"}
                  </p>
                </div>
                <CloudinaryUpload
                  value={form.thumbnail_url}
                  onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                  folder="htb-courses"
                  label="Thumbnail"
                />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
                  <label htmlFor="published" className="text-sm text-foreground">Published (visible to students)</label>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title} className="w-full">
                  {saveMutation.isPending ? "Saving..." : editing ? "Update Course" : "Create Course"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Course List */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
          ) : (courses || []).length === 0 ? (
            <Card className="border-border bg-card"><CardContent className="p-8 text-center text-muted-foreground">No courses yet. Create your first course!</CardContent></Card>
          ) : (
            (courses || []).map((course: any) => (
              <Card key={course.id} className="border-border bg-card hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">{course.title}</h3>
                      {course.published ? (
                        <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px]">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">{course.course_type === "live" ? "🔴 Live" : course.course_type === "book" ? "📚 Book" : "📹 Video"}</Badge>
                      <span>{course.category}</span>
                      <span>{course.skill_level}</span>
                      <span>{course.total_duration}</span>
                      <span>{course.price > 0 ? `£${course.price}` : "Free"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Publish toggle */}
                    <Button size="icon" variant="ghost" className="h-8 w-8" title={course.published ? "Unpublish" : "Publish"} onClick={() => togglePublish.mutate({ id: course.id, published: !course.published })}>
                      {course.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    {/* Lock toggle */}
                    <Button
                      size="icon"
                      variant="ghost"
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
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(course)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(course.id)}>
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
