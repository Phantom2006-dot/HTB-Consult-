import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays, Clock, Users, CheckCircle2, AlertCircle,
  XCircle, ArrowRight, Video, MessageSquare, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp, scaleIn } from "@/lib/animations";
import Layout from "@/components/Layout";
import { useMyBookings } from "@/hooks/use-bookings";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
}
function getInitials(name: string) {
  return (name || "M").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
  confirmed: { label: "Confirmed",  icon: CheckCircle2, classes: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
  pending:   { label: "Pending",    icon: AlertCircle,  classes: "text-amber-400  bg-amber-500/10  border-amber-500/25"  },
  cancelled: { label: "Cancelled",  icon: XCircle,      classes: "text-red-400    bg-red-500/10    border-red-500/25"    },
  completed: { label: "Completed",  icon: CheckCircle2, classes: "text-blue-400   bg-blue-500/10   border-blue-500/25"   },
};

const Sessions = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: bookings, isLoading } = useMyBookings();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }
  if (!user) return null;

  const now = new Date();
  const upcoming  = (bookings || []).filter((b: any) => new Date(b.session_date) >= now && b.status !== "cancelled");
  const past      = (bookings || []).filter((b: any) => new Date(b.session_date) <  now || b.status === "completed");
  const cancelled = (bookings || []).filter((b: any) => b.status === "cancelled");

  const summaryStats = [
    { label: "Total Booked",   value: (bookings || []).length,   icon: CalendarDays, iconBg: "bg-blue-500/15",    iconColor: "text-blue-400",    border: "border-blue-500/20" },
    { label: "Upcoming",       value: upcoming.length,            icon: Clock,        iconBg: "bg-amber-500/15",   iconColor: "text-amber-400",   border: "border-amber-500/20" },
    { label: "Completed",      value: past.filter((b: any) => b.status === "completed").length, icon: CheckCircle2, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", border: "border-emerald-500/20" },
    { label: "Mentors Met",    value: new Set((bookings || []).map((b: any) => b.mentor_id)).size, icon: Users, iconBg: "bg-primary/15", iconColor: "text-primary", border: "border-primary/20" },
  ];

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-white">My Sessions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All your booked mentoring sessions in one place.
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {summaryStats.map((s, i) => (
            <motion.div key={s.label} variants={scaleIn} custom={i * 0.08} initial="hidden" animate="visible">
              <div className={`rounded-2xl bg-card border ${s.border} p-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} border ${s.border} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className={s.iconColor} />
                </div>
                <div>
                  {isLoading
                    ? <Skeleton className="h-7 w-8 mb-0.5" />
                    : <p className="text-2xl font-bold text-white">{s.value}</p>
                  }
                  <p className="text-xs text-white/45 font-medium">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming Sessions */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-amber-400" />
              Upcoming Sessions
            </h2>
            <Button asChild size="sm" className="bg-gradient-gold hover:opacity-90 btn-shimmer font-semibold text-xs h-8 px-3">
              <Link to="/mentors"><Users size={13} /> Book a Mentor</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border p-4 flex gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <CalendarDays size={24} className="text-primary/50" />
              </div>
              <p className="text-white/50 text-sm font-medium mb-1">No upcoming sessions</p>
              <p className="text-white/30 text-xs mb-5">Book a session with one of our expert mentors to get personalised guidance.</p>
              <Button asChild size="sm" className="bg-gradient-gold hover:opacity-90 btn-shimmer font-semibold">
                <Link to="/mentors">Find a Mentor</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b: any, i: number) => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                const initials = getInitials(b.mentor_name || "Mentor");
                return (
                  <motion.div
                    key={b.id}
                    initial="hidden" animate="visible"
                    variants={fadeUp} custom={i * 0.06}
                  >
                    <div className="rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 p-4 lg:p-5">
                      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                        {/* Mentor Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 overflow-hidden">
                          {b.mentor_avatar
                            ? <img src={b.mentor_avatar} alt={b.mentor_name} className="w-full h-full object-cover" />
                            : <span className="text-sm font-bold text-primary">{initials}</span>
                          }
                        </div>

                        {/* Session Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-white text-sm">
                              {b.mentor_name || "Mentor Session"}
                            </p>
                            {b.mentor_title && (
                              <span className="text-[11px] text-white/40">· {b.mentor_title}</span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${cfg.classes}`}>
                              <StatusIcon size={10} /> {cfg.label}
                            </span>
                          </div>
                          {b.mentor_specialty && (
                            <p className="text-xs text-primary/70 mb-2">{b.mentor_specialty}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-white/45">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={12} className="text-white/30" />
                              {formatDate(b.session_date)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} className="text-white/30" />
                              {formatTime(b.start_time)} – {formatTime(b.end_time)}
                            </span>
                          </div>
                          {b.notes && (
                            <p className="mt-2 text-xs text-white/35 bg-white/3 rounded-lg px-3 py-2 border border-white/6 line-clamp-2">
                              {b.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {b.meeting_link && (
                            <a
                              href={b.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
                            >
                              <Video size={12} /> Join
                            </a>
                          )}
                          <Link
                            to="/messages"
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            <MessageSquare size={12} /> Message
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Past Sessions */}
        {!isLoading && past.length > 0 && (
          <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/20 to-white/5" />
              Past Sessions
            </h2>
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="divide-y divide-border/40">
                {past.map((b: any) => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.completed;
                  const StatusIcon = cfg.icon;
                  const initials = getInitials(b.mentor_name || "Mentor");
                  return (
                    <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors opacity-70">
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 overflow-hidden">
                        {b.mentor_avatar
                          ? <img src={b.mentor_avatar} alt={b.mentor_name} className="w-full h-full object-cover" />
                          : <span className="text-xs font-bold text-white/40">{initials}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/70 truncate">{b.mentor_name || "Mentor Session"}</p>
                        <p className="text-xs text-white/35">{formatDateShort(b.session_date)} · {formatTime(b.start_time)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${cfg.classes}`}>
                        <StatusIcon size={10} /> {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* Cancelled */}
        {!isLoading && cancelled.length > 0 && (
          <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <h2 className="text-base font-serif font-bold text-white/50 flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-red-500/30" />
              Cancelled Sessions
            </h2>
            <div className="rounded-2xl bg-card border border-border overflow-hidden opacity-50">
              <div className="divide-y divide-border/40">
                {cancelled.map((b: any) => {
                  const initials = getInitials(b.mentor_name || "Mentor");
                  return (
                    <div key={b.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-9 h-9 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center shrink-0 overflow-hidden">
                        {b.mentor_avatar
                          ? <img src={b.mentor_avatar} alt={b.mentor_name} className="w-full h-full object-cover grayscale" />
                          : <span className="text-xs font-bold text-white/25">{initials}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/40 truncate line-through">{b.mentor_name || "Mentor Session"}</p>
                        <p className="text-xs text-white/25">{formatDateShort(b.session_date)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border text-red-400 bg-red-500/10 border-red-500/25">
                        <XCircle size={10} /> Cancelled
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* CTA if no bookings at all */}
        {!isLoading && (bookings || []).length === 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <div className="rounded-2xl border border-border overflow-hidden relative" style={{ background: "hsl(var(--hero-gradient-from))" }}>
              <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/8 blur-[70px] pointer-events-none" />
              <div className="relative z-10 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-primary/60" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">Book Your First Session</h3>
                <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
                  Connect with an expert mentor for personalised guidance on your learning journey.
                </p>
                <Button asChild className="bg-gradient-gold hover:opacity-90 btn-shimmer font-semibold gap-2">
                  <Link to="/mentors">
                    <Users size={15} /> Browse Mentors <ArrowRight size={14} />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </Layout>
  );
};

export default Sessions;
