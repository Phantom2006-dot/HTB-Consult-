import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, EyeOff, Trash2, Star, Briefcase, Users, ChevronRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const AdminMentors = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const { data: mentors, isLoading } = useQuery({
    queryKey: ["admin-mentors"],
    queryFn: () => api.get<any[]>("/api/admin/mentors"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/mentors/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mentors"] });
      toast({ title: "Mentor deleted" });
      setConfirmDelete(null);
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setConfirmDelete(null);
    },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/api/mentors/admin/${id}`, { published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-mentors"] }),
  });

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const filtered = (mentors || []).filter((m: any) => {
    const q = search.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.title || "").toLowerCase().includes(q) ||
      (m.specializations || []).some((s: string) => s.toLowerCase().includes(q))
    );
  });

  const published = filtered.filter((m: any) => m.published);
  const drafts = filtered.filter((m: any) => !m.published);

  const MentorCard = ({ mentor }: { mentor: any }) => (
    <Card
      key={mentor.id}
      className="border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer group"
      onClick={() => navigate(`/admin/mentors/${mentor.id}`)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        {mentor.avatar_url ? (
          <img src={mentor.avatar_url} alt={mentor.name} className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all">
            {getInitials(mentor.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{mentor.name}</h3>
            {mentor.published
              ? <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px]">Live</Badge>
              : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate mb-1">{mentor.title}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star size={11} className="text-amber-500" /> {parseFloat(mentor.rating || 0).toFixed(1)}</span>
            <span className="flex items-center gap-1"><Briefcase size={11} /> {mentor.years_experience}y exp</span>
            <span className="flex items-center gap-1"><Users size={11} /> {mentor.total_sessions} sessions</span>
            <span className="font-medium text-foreground">£{mentor.hourly_rate}/hr</span>
          </div>
          {(mentor.specializations || []).length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {mentor.specializations.slice(0, 4).map((s: string) => (
                <span key={s} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{s}</span>
              ))}
              {mentor.specializations.length > 4 && (
                <span className="text-[10px] text-muted-foreground">+{mentor.specializations.length - 4} more</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title={mentor.published ? "Unpublish" : "Publish"}
            onClick={(e) => { e.stopPropagation(); togglePublish.mutate({ id: mentor.id, published: !mentor.published }); }}
          >
            {mentor.published ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete mentor"
            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: mentor.id, name: mentor.name }); }}
          >
            <Trash2 size={14} />
          </Button>
          <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors ml-1" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Mentors</h1>
            <p className="text-sm text-muted-foreground">
              {(mentors || []).length} total · {(mentors || []).filter((m: any) => m.published).length} live
            </p>
          </div>
          <Button onClick={() => navigate("/admin/mentors/new")} className="gap-1.5 shrink-0">
            <Plus size={16} /> New Mentor
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input
            placeholder="Search by name, title or specialization…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-sm"
          />
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-10 text-center text-muted-foreground">
              {search ? "No mentors match your search." : "No mentors yet. Add your first mentor!"}
            </CardContent>
          </Card>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-4">
            {published.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live ({published.length})</p>
                <div className="space-y-2">
                  {published.map((m: any) => <MentorCard key={m.id} mentor={m} />)}
                </div>
              </div>
            )}
            {drafts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Drafts ({drafts.length})</p>
                <div className="space-y-2">
                  {drafts.map((m: any) => <MentorCard key={m.id} mentor={m} />)}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete mentor?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete <strong>"{confirmDelete?.name}"</strong> and all their availability slots and bookings. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminMentors;
