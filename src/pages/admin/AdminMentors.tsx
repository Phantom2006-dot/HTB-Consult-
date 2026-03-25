import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

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

const emptyMentor: MentorForm = {
  name: "", title: "", bio: "", avatar_url: "", specializations: "", years_experience: "0", hourly_rate: "0", published: false,
};

const AdminMentors = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<MentorForm>(emptyMentor);

  const { data: mentors, isLoading } = useQuery({
    queryKey: ["admin-mentors"],
    queryFn: () => api.get<any[]>("/api/admin/mentors"),
  });

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
      if (editing) {
        await api.patch(`/api/admin/mentors/${editing}`, payload);
      } else {
        await api.post("/api/admin/mentors", payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mentors"] });
      qc.invalidateQueries({ queryKey: ["mentors"] });
      setOpen(false);
      setEditing(null);
      setForm(emptyMentor);
      toast({ title: editing ? "Mentor updated" : "Mentor created" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save mentor.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/mentors/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mentors"] });
      qc.invalidateQueries({ queryKey: ["mentors"] });
      toast({ title: "Mentor deleted" });
    },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/api/admin/mentors/${id}`, { published }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mentors"] });
    },
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
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyMentor);
    setOpen(true);
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Mentors</h1>
            <p className="text-sm text-muted-foreground">{(mentors || []).length} total mentors</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gap-1.5"><Plus size={16} /> New Mentor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Mentor" : "Create Mentor"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Title</label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Business Analyst" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Bio</label>
                  <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Brief bio" />
                </div>
                <CloudinaryUpload
                  value={form.avatar_url}
                  onChange={(url) => setForm({ ...form, avatar_url: url })}
                  folder="htb-mentors"
                  label="Profile Photo"
                />
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Specializations (comma separated)</label>
                  <Input value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} placeholder="BA, PRINCE2, Agile" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Years Experience</label>
                    <Input type="number" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Hourly Rate (£)</label>
                    <Input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
                  <label htmlFor="published" className="text-sm text-foreground">Published (visible to students)</label>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name} className="w-full">
                  {saveMutation.isPending ? "Saving..." : editing ? "Update Mentor" : "Create Mentor"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
          ) : (mentors || []).length === 0 ? (
            <Card className="border-border bg-card"><CardContent className="p-8 text-center text-muted-foreground">No mentors yet. Add your first mentor!</CardContent></Card>
          ) : (
            (mentors || []).map((mentor: any) => (
              <Card key={mentor.id} className="border-border bg-card hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {getInitials(mentor.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">{mentor.name}</h3>
                      {mentor.published ? (
                        <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px]">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{mentor.title}</span>
                      <span>{mentor.years_experience} yrs</span>
                      <span>{mentor.total_sessions} sessions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => togglePublish.mutate({ id: mentor.id, published: !mentor.published })}>
                      {mentor.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(mentor)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(mentor.id)}>
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

export default AdminMentors;
