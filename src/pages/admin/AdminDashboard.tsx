import { motion } from "framer-motion";
import { BookOpen, Users, GraduationCap, TrendingUp, UserCheck, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    { icon: BookOpen, label: "Total Courses", value: stats?.courses ?? 0, color: "text-blue-500" },
    { icon: Users, label: "Total Mentors", value: stats?.mentors ?? 0, color: "text-green-500" },
    { icon: GraduationCap, label: "Enrollments", value: stats?.enrollments ?? 0, color: "text-primary" },
    { icon: UserCheck, label: "Users", value: stats?.users ?? 0, color: "text-purple-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-serif font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your platform</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon size={22} />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-6 w-10" /> : <p className="text-2xl font-bold text-foreground">{s.value}</p>}
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to="/admin/courses">Manage Courses</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/mentors">Manage Mentors</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/users">Manage Users</Link></Button>
          </div>
        </motion.div>

        {/* Recent Enrollments */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Enrollments</h2>
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              {!recentEnrollments || recentEnrollments.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">No enrollments yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {recentEnrollments.map((e: any) => (
                    <div key={e.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{e.courses?.title || "Unknown course"}</p>
                        <p className="text-xs text-muted-foreground">Progress: {e.progress}%</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(e.enrolled_at).toLocaleDateString()}</p>
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
