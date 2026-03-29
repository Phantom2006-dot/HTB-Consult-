import { motion } from "framer-motion";
import { BookOpen, Users, GraduationCap, UserCheck, PoundSterling, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useAdminStats } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  const { data: recentEnrollments } = useQuery({
    queryKey: ["admin-recent-enrollments"],
    queryFn: () => api.get<any[]>("/api/admin/recent-enrollments"),
  });

  const statCards = [
    { icon: BookOpen, label: "Published Courses", value: stats?.courses ?? 0, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Users, label: "Active Mentors", value: stats?.mentors ?? 0, color: "text-green-500", bg: "bg-green-500/10" },
    { icon: GraduationCap, label: "Enrollments", value: stats?.enrollments ?? 0, color: "text-primary", bg: "bg-primary/10" },
    { icon: UserCheck, label: "Registered Users", value: stats?.users ?? 0, color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: CheckCircle2, label: "Completions", value: stats?.completed ?? 0, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    {
      icon: PoundSterling,
      label: "Total Revenue",
      value: stats?.revenue != null ? `£${stats.revenue.toLocaleString()}` : "£0",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  const quickActions = [
    { label: "Manage Courses", href: "/admin/courses", primary: true },
    { label: "Manage Mentors", href: "/admin/mentors" },
    { label: "Manage Users", href: "/admin/users" },
    { label: "View Enrollments", href: "/admin/enrollments" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-serif font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview at a glance</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon size={22} />
                </div>
                <div className="min-w-0">
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <Button
                key={a.label}
                size="sm"
                variant={a.primary ? "default" : "outline"}
                asChild
                className={a.primary ? "bg-gradient-gold hover:opacity-90 gap-1.5" : "gap-1.5"}
              >
                <Link to={a.href}>
                  {a.label} <ArrowRight size={13} />
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Recent Enrollments */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Enrollments</h2>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-muted-foreground hover:text-foreground">
              <Link to="/admin/enrollments">View all <ArrowRight size={12} /></Link>
            </Button>
          </div>
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              {!recentEnrollments || recentEnrollments.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">No enrollments yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {recentEnrollments.map((e: any) => (
                    <div key={e.id} className="px-5 py-3 flex items-center gap-4">
                      {/* User initial avatar */}
                      <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {(e.full_name || e.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {e.courses?.title || "Unknown course"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {e.full_name || e.email || "Unknown user"}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {e.completed ? (
                          <Badge className="bg-green-500/10 text-green-500 border-0 text-[10px]">Completed</Badge>
                        ) : e.progress > 0 ? (
                          <Badge variant="secondary" className="text-[10px]">{e.progress}%</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">New</Badge>
                        )}
                        <p className="text-[11px] text-muted-foreground hidden sm:block">
                          {new Date(e.enrolled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
