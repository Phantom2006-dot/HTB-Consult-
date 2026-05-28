import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Trash2, Plus, Check, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  full_name: string;
  email: string;
  course_title: string;
  thumbnail_url: string | null;
  verification_code: string;
  issued_at: string;
}

const AdminCertificates = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ["admin-certificates"],
    queryFn: () => api.get("/api/certificates"),
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["admin-users-list"],
    queryFn: () => api.get("/api/admin/users"),
    enabled: open,
  });

  const { data: courses = [] } = useQuery<any[]>({
    queryKey: ["admin-courses"],
    queryFn: () => api.get("/api/admin/courses"),
    enabled: open,
  });

  const issueMutation = useMutation({
    mutationFn: () => api.post("/api/certificates", { user_id: selectedUserId, course_id: selectedCourseId }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["admin-certificates"] });
      if (data?.message === "Certificate already issued") {
        toast({ title: "Already issued", description: "This student already has a certificate for that course." });
      } else {
        toast({ title: "Certificate issued!", description: "The student has been notified." });
      }
      setOpen(false);
      setSelectedUserId("");
      setSelectedCourseId("");
      setUserSearch("");
      setCourseSearch("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message || "Failed to issue certificate.", variant: "destructive" }),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/certificates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-certificates"] });
      toast({ title: "Certificate revoked" });
    },
    onError: () => toast({ title: "Error", description: "Failed to revoke certificate.", variant: "destructive" }),
  });

  const filteredCerts = (certificates || []).filter((c) => {
    const q = search.toLowerCase();
    return !q || c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.course_title.toLowerCase().includes(q);
  });

  const filteredUsers = (users as any[]).filter((u: any) =>
    !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredCourses = (courses as any[]).filter((c: any) =>
    !courseSearch || c.title?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const selectedUser = (users as any[]).find((u: any) => u.id === selectedUserId);
  const selectedCourse = (courses as any[]).find((c: any) => c.id === selectedCourseId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Certificates</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Issue certificates to students — they'll receive an in-app notification
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-1.5 bg-gradient-gold hover:opacity-90">
            <Plus size={15} /> Issue Certificate
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Award size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{(certificates || []).length}</p>
              <p className="text-xs text-muted-foreground">Certificates issued</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, or course…"
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>
        </motion.div>

        {/* Certificates List */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : filteredCerts.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Award size={26} className="text-amber-400/60" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {search ? `No certificates matching "${search}"` : "No certificates issued yet. Click \"Issue Certificate\" to get started."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCerts.map((cert, i) => (
              <motion.div key={cert.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="border-border bg-card hover:border-amber-500/20 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Course thumbnail */}
                    {cert.thumbnail_url ? (
                      <img src={cert.thumbnail_url} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0 border border-border" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Award size={16} className="text-amber-400" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">{cert.full_name}</p>
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 shrink-0">
                          <Award size={9} className="mr-1" /> Certified
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{cert.email}</p>
                      <p className="text-xs text-primary/80 truncate mt-0.5">{cert.course_title}</p>
                    </div>

                    {/* Date + revoke */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Issued</p>
                        <p className="text-xs font-medium text-foreground">
                          {new Date(cert.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Revoke certificate"
                        onClick={() => {
                          if (confirm(`Revoke certificate for ${cert.full_name} (${cert.course_title})?`)) {
                            revokeMutation.mutate(cert.id);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* ── Issue Certificate Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award size={18} className="text-amber-400" /> Issue a Certificate
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-1">
            {/* Step 1: Pick student */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">1. Select student</label>
              {selectedUser ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedUser.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => { setSelectedUserId(""); setUserSearch(""); }}>
                    <X size={13} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search students by name or email…"
                      className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                    {filteredUsers.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No students found</p>
                    ) : (
                      filteredUsers.slice(0, 20).map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUserId(u.id)}
                          className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-sm text-foreground">{u.full_name || u.email}</p>
                            <p className="text-[11px] text-muted-foreground">{u.email}</p>
                          </div>
                          <Check size={13} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Pick course */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">2. Select course</label>
              {selectedCourse ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-foreground truncate">{selectedCourse.title}</p>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 ml-2" onClick={() => { setSelectedCourseId(""); setCourseSearch(""); }}>
                    <X size={13} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search courses…"
                      className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                    {filteredCourses.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No courses found</p>
                    ) : (
                      filteredCourses.slice(0, 20).map((c: any) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCourseId(c.id)}
                          className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center justify-between group"
                        >
                          <p className="text-sm text-foreground truncate">{c.title}</p>
                          <Check size={13} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview + Submit */}
            {selectedUser && selectedCourse && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-1">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Certificate preview</p>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{selectedUser.full_name}</span> will receive a certificate for
                </p>
                <p className="text-sm text-primary font-medium">"{selectedCourse.title}"</p>
                <p className="text-[11px] text-muted-foreground mt-1">An in-app notification will be sent to the student automatically.</p>
              </div>
            )}

            <Button
              onClick={() => issueMutation.mutate()}
              disabled={!selectedUserId || !selectedCourseId || issueMutation.isPending}
              className="w-full bg-gradient-gold hover:opacity-90 font-semibold gap-2"
              size="lg"
            >
              {issueMutation.isPending ? "Issuing…" : <><Award size={16} /> Issue Certificate</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCertificates;
