import { motion } from "framer-motion";
import { Bell, CheckCircle2, BookOpen, Calendar, Info, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; dot: string }> = {
  success:  { icon: CheckCircle2, color: "text-green-500",  dot: "bg-green-500" },
  enroll:   { icon: BookOpen,     color: "text-primary",    dot: "bg-primary" },
  info:     { icon: Info,         color: "text-blue-400",   dot: "bg-blue-400" },
  warning:  { icon: Calendar,     color: "text-amber-500",  dot: "bg-amber-500" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (mins > 0) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  return "Just now";
}

const Notifications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<any[]>("/api/notifications"),
    enabled: !!user,
  });

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1 flex items-center gap-2">
            <Bell size={22} className="text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground text-sm">Your latest activity and updates</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !notifications || notifications.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-10 text-center">
                <Clock size={36} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No notifications yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Enroll in a course or book a session to see activity here.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((n: any) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <Card key={n.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.desc}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo(n.time)}</span>
                  </CardContent>
                </Card>
              );
            })
          )}
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default Notifications;
