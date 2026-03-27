import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Search, BookOpen, User } from "lucide-react";

const AdminEnrollments = () => {
  const [search, setSearch] = useState("");

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: () => api.get<any[]>("/api/admin/enrollments"),
  });

  const filtered = (enrollments || []).filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.full_name || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.courses?.title || "").toLowerCase().includes(q)
    );
  });

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    return (email || "?")[0].toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-serif font-bold text-foreground">Enrollments</h1>
          <p className="text-sm text-muted-foreground">{(enrollments || []).length} total enrollments</p>
        </motion.div>

        {/* Search */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input
            placeholder="Search by name, email or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-sm"
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
          ) : filtered.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                {search ? "No enrollments match your search." : "No enrollments yet."}
              </CardContent>
            </Card>
          ) : (
            filtered.map((enrollment: any) => (
              <Card key={enrollment.id} className="border-border bg-card hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* User avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(enrollment.full_name, enrollment.email)}
                  </div>

                  {/* User + course info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <User size={12} className="text-muted-foreground shrink-0" />
                      <p className="text-sm font-semibold text-foreground truncate">
                        {enrollment.full_name || "Unnamed User"}
                      </p>
                      <span className="text-xs text-muted-foreground truncate hidden sm:block">
                        {enrollment.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} className="text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">
                        {enrollment.courses?.title || "Unknown Course"}
                      </p>
                      {enrollment.courses?.category && (
                        <span className="text-[10px] text-muted-foreground/60 hidden md:block">
                          · {enrollment.courses.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress + status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{enrollment.progress ?? 0}%</p>
                      <p className="text-[10px] text-muted-foreground">progress</p>
                    </div>
                    {enrollment.completed ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">Completed</Badge>
                    ) : (enrollment.progress ?? 0) > 0 ? (
                      <Badge variant="secondary" className="text-[10px]">In Progress</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-border">Not Started</Badge>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {new Date(enrollment.enrolled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminEnrollments;
