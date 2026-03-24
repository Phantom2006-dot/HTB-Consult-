import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminEnrollments = () => {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, courses(title, category)")
        .order("enrolled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-serif font-bold text-foreground">Enrollments</h1>
          <p className="text-sm text-muted-foreground">{(enrollments || []).length} total enrollments</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : (enrollments || []).length === 0 ? (
            <Card className="border-border bg-card"><CardContent className="p-8 text-center text-muted-foreground">No enrollments yet.</CardContent></Card>
          ) : (
            (enrollments || []).map((enrollment: any) => (
              <Card key={enrollment.id} className="border-border bg-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{enrollment.courses?.title || "Unknown"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{enrollment.courses?.category}</span>
                      <span>User: {enrollment.user_id.slice(0, 8)}…</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{enrollment.progress}%</p>
                      <p className="text-[10px] text-muted-foreground">progress</p>
                    </div>
                    {enrollment.completed ? (
                      <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px]">Completed</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">In Progress</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
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
