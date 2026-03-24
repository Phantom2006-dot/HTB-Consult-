import { motion } from "framer-motion";
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp } from "@/lib/animations";
import Layout from "@/components/Layout";

const notifications = [
  { id: 1, icon: CheckCircle, title: "Enrollment confirmed", desc: "You've been enrolled in Project Management.", time: "2 hours ago", type: "success" },
  { id: 2, icon: Info, title: "New course available", desc: "Business Analysis Techniques is now live.", time: "5 hours ago", type: "info" },
  { id: 3, icon: AlertTriangle, title: "Session reminder", desc: "Your mentoring session starts tomorrow at 3 PM.", time: "1 day ago", type: "warning" },
  { id: 4, icon: Info, title: "CV Review update", desc: "Your CV review feedback is ready.", time: "2 days ago", type: "info" },
];

const typeColors: Record<string, string> = {
  success: "text-green-400",
  info: "text-primary",
  warning: "text-accent",
};

const Notifications = () => (
  <Layout>
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1 flex items-center gap-2">
          <Bell size={22} className="text-primary" /> Notifications
        </h1>
        <p className="text-muted-foreground text-sm">Stay updated on your activity</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-start gap-3">
              <n.icon size={20} className={`shrink-0 mt-0.5 ${typeColors[n.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  </Layout>
);

export default Notifications;
