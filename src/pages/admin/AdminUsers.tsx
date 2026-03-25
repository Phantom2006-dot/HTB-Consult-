import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const AdminUsers = () => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: () => api.get<any[]>("/api/admin/users"),
  });

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-serif font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">{(profiles || []).length} registered users</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : (profiles || []).length === 0 ? (
            <Card className="border-border bg-card"><CardContent className="p-8 text-center text-muted-foreground">No users yet.</CardContent></Card>
          ) : (
            (profiles || []).map((profile: any) => (
                <Card key={profile.id} className="border-border bg-card">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitials(profile.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{profile.full_name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(profile.roles || []).map((r: string) => (
                        <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="text-[10px]">{r}</Badge>
                      ))}
                      {(!profile.roles || profile.roles.length === 0) && (
                        <Badge variant="outline" className="text-[10px]">student</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">{new Date(profile.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
            ))
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
