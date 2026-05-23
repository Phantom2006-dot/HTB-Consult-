import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, GraduationCap, Award, Users, Lock, X,
  ArrowRight, Compass, CalendarDays, Bookmark, FileText,
  Bell, TrendingUp, ChevronRight, Play, Newspaper, Star,
  CheckCircle2, AlertCircle, MoreVertical, Eye
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp, scaleIn } from "@/lib/animations";
import Layout from "@/components/Layout";
import { useCourses } from "@/hooks/use-courses";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useMyBookings } from "@/hooks/use-bookings";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface FeaturedArticle {
  id: string; title: string; slug: string; excerpt: string | null;
  cover_image_url: string | null; read_time_minutes: number;
  is_featured: boolean; created_at: string; author_name: string | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
}
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

const QUICK_ACTIONS = [
  { icon: Compass,     label: "Browse Courses",  path: "/explore",      color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: Users,       label: "Book a Mentor",   path: "/mentors",      color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
  { icon: Bookmark,    label: "Saved Courses",   path: "/saved",        color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  { icon: Newspaper,   label: "Read the Blog",   path: "/blog",         color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
];

const PIE_COLORS = ["#10b981", "#f97316", "#94a3b8"];

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [lockedCourse, setLockedCourse] = useState<{ title: string; category: string } | null>(null);

  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: bookingsData, isLoading: bookingsLoading } = useMyBookings();
  const { data: featuredArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["featured-articles"],
    queryFn: () => api.get<FeaturedArticle[]>("/api/articles/featured"),
  });
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<any[]>("/api/notifications"),
  });

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

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";

  const enrolledCourses = (enrollmentsData || []).map((e: any) => ({
    ...e.courses,
    progress: e.progress,
    completed: e.completed,
    enrolled_at: e.enrolled_at,
  }));

  const inProgress = enrolledCourses.filter((e: any) => !e.completed && e.progress > 0);
  const completed  = enrolledCourses.filter((e: any) => e.completed);
  const notStarted = enrolledCourses.filter((e: any) => e.progress === 0 && !e.completed);

  // Upcoming sessions (future bookings sorted by date)
  const upcomingSessions = (bookingsData || [])
    .filter((b: any) => new Date(b.session_date) >= new Date())
    .sort((a: any, b: any) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
    .slice(0, 4);

  // Engagement donut data
  const totalEnrolled = enrolledCourses.length;
  const pieData = totalEnrolled === 0
    ? [{ name: "No courses yet", value: 1, color: "#334155" }]
    : [
        { name: "Completed",   value: completed.length,  color: "#10b981" },
        { name: "In Progress", value: inProgress.length, color: "#f97316" },
        { name: "Not Started", value: notStarted.length, color: "#475569" },
      ].filter(d => d.value > 0);

  const overallPct = totalEnrolled === 0
    ? 0
    : Math.round(enrolledCourses.reduce((s: number, c: any) => s + (c.progress || 0), 0) / totalEnrolled);

  // Performance chart data (progress per enrolled course)
  const chartData = enrolledCourses.slice(0, 8).map((c: any) => ({
    name: (c.title || "").split(" ").slice(0, 2).join(" "),
    progress: c.progress || 0,
  }));

  const statCards = [
    {
      label: "Enrolled Courses",
      sublabel: "Active Courses",
      value: enrolledCourses.length,
      icon: BookOpen,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
      border: "border-blue-500/20",
      link: "/my-learning",
      linkLabel: "View all courses",
    },
    {
      label: "In Progress",
      sublabel: "Currently Learning",
      value: inProgress.length,
      icon: Clock,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      border: "border-amber-500/20",
      link: "/my-learning",
      linkLabel: "Continue learning",
    },
    {
      label: "Sessions Booked",
      sublabel: "Mentoring Sessions",
      value: (bookingsData || []).length,
      icon: CalendarDays,
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-400",
      border: "border-purple-500/20",
      link: "/mentors",
      linkLabel: "View sessions",
    },
    {
      label: "Completed",
      sublabel: "Finished Courses",
      value: completed.length,
      icon: Award,
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      border: "border-primary/20",
      link: "/my-learning",
      linkLabel: "View certificates",
    },
  ];

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">

        {/* ── Welcome Header ──────────────────────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-white">
            Welcome back, {displayName.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what's happening with your courses and learning today.
          </p>
        </motion.div>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {statCards.map((s, i) => (
            <motion.div key={s.label} variants={scaleIn} custom={i * 0.08} initial="hidden" animate="visible">
              <div className={`rounded-2xl bg-card border ${s.border} p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-300 group`}>
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl ${s.iconBg} border ${s.border} flex items-center justify-center`}>
                    <s.icon size={20} className={s.iconColor} />
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${s.iconColor} opacity-60`}>{s.sublabel}</span>
                </div>
                {enrollmentsLoading ? (
                  <Skeleton className="h-10 w-14" />
                ) : (
                  <p className="text-4xl font-bold text-white">{s.value}</p>
                )}
                <p className="text-sm font-medium text-white/60">{s.label}</p>
                <Link
                  to={s.link}
                  className={`text-xs font-semibold ${s.iconColor} hover:underline flex items-center gap-1 mt-auto`}
                >
                  {s.linkLabel} <ArrowRight size={11} />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

          {/* ── LEFT column ─────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">

            {/* My Courses Table */}
            <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-serif font-bold text-white text-base">My Courses</h2>
                  <Link to="/my-learning" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
                    View all courses <ArrowRight size={12} />
                  </Link>
                </div>

                {enrollmentsLoading ? (
                  <div className="p-5 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                      <BookOpen size={22} className="text-primary/50" />
                    </div>
                    <p className="text-white/40 text-sm mb-3">No courses enrolled yet.</p>
                    <Button asChild size="sm" className="bg-gradient-gold hover:opacity-90 btn-shimmer font-semibold">
                      <Link to="/explore">Browse Courses</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Course Title</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider hidden md:table-cell">Enrolled</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider w-40">Progress</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider hidden lg:table-cell">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledCourses.map((item: any, i: number) => (
                          <tr
                            key={item.id}
                            className={`border-b border-border/30 hover:bg-white/3 transition-colors ${i === enrolledCourses.length - 1 ? "border-b-0" : ""}`}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                                  {item.thumbnail_url
                                    ? <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                                    : <BookOpen size={15} className="text-white/20" />
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-white text-sm truncate max-w-[160px] lg:max-w-[220px]">{item.title}</p>
                                  <p className="text-[11px] text-white/35 truncate">{item.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-white/45 hidden md:table-cell whitespace-nowrap">
                              {formatDateShort(item.enrolled_at)}
                            </td>
                            <td className="px-4 py-3.5 w-40">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.progress || 0}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 + i * 0.05 }}
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                                  />
                                </div>
                                <span className="text-xs font-semibold text-white/60 w-8 shrink-0">{item.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 hidden lg:table-cell">
                              {item.is_locked ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 rounded-lg px-2 py-1">
                                  <Lock size={10} /> Locked
                                </span>
                              ) : item.completed ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 rounded-lg px-2 py-1">
                                  <CheckCircle2 size={10} /> Completed
                                </span>
                              ) : item.progress > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 rounded-lg px-2 py-1">
                                  <Play size={10} /> In Progress
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40 bg-white/5 rounded-lg px-2 py-1">
                                  <AlertCircle size={10} /> Not Started
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => item.is_locked
                                  ? setLockedCourse({ title: item.title, category: item.category })
                                  : navigate(`/course/${item.id}`)
                                }
                                className="p-1.5 rounded-lg text-white/40 hover:text-primary hover:bg-primary/10 transition-all"
                              >
                                <Eye size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Charts Row */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Learning Engagement Donut */}
              <div className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-white text-sm">Learning Engagement</h3>
                    <p className="text-[11px] text-white/40 mt-0.5">Course progress breakdown</p>
                  </div>
                </div>
                {enrollmentsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Skeleton className="w-32 h-32 rounded-full" />
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <div className="relative w-36 h-36 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%" cy="50%"
                            innerRadius={42} outerRadius={62}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "hsl(163,36%,14%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
                            labelStyle={{ color: "white" }}
                            itemStyle={{ color: "white" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-white">{overallPct}%</p>
                        <p className="text-[10px] text-white/40 leading-tight text-center">Overall<br />Progress</p>
                      </div>
                    </div>
                    <div className="space-y-2.5 flex-1">
                      {totalEnrolled === 0 ? (
                        <p className="text-xs text-white/30">No courses enrolled yet</p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="text-xs text-white/60">Completed</span>
                            </div>
                            <span className="text-xs font-bold text-white">{completed.length} <span className="text-white/30 font-normal">({totalEnrolled > 0 ? Math.round(completed.length / totalEnrolled * 100) : 0}%)</span></span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                              <span className="text-xs text-white/60">In Progress</span>
                            </div>
                            <span className="text-xs font-bold text-white">{inProgress.length} <span className="text-white/30 font-normal">({totalEnrolled > 0 ? Math.round(inProgress.length / totalEnrolled * 100) : 0}%)</span></span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                              <span className="text-xs text-white/60">Not Started</span>
                            </div>
                            <span className="text-xs font-bold text-white">{notStarted.length} <span className="text-white/30 font-normal">({totalEnrolled > 0 ? Math.round(notStarted.length / totalEnrolled * 100) : 0}%)</span></span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <Link to="/my-learning" className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
                  View full progress report <ArrowRight size={11} />
                </Link>
              </div>

              {/* Performance Overview Area Chart */}
              <div className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-white text-sm">Performance Overview</h3>
                    <p className="text-[11px] text-white/40 mt-0.5">Progress per enrolled course</p>
                  </div>
                </div>
                {enrollmentsLoading ? (
                  <Skeleton className="h-32 w-full rounded-xl" />
                ) : chartData.length === 0 ? (
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-xs text-white/30">No data yet — enrol in a course to track progress.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={130}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                      <defs>
                        <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(30,100%,46%)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(30,100%,46%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{ background: "hsl(163,36%,14%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
                        labelStyle={{ color: "white" }}
                        itemStyle={{ color: "hsl(30,100%,46%)" }}
                        formatter={(v: any) => [`${v}%`, "Progress"]}
                      />
                      <Area type="monotone" dataKey="progress" stroke="hsl(30,100%,46%)" strokeWidth={2} fill="url(#progressGrad)" dot={{ r: 3, fill: "hsl(30,100%,46%)", strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                {!enrollmentsLoading && chartData.length > 0 && (
                  <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border/50">
                    <div>
                      <p className="text-lg font-bold text-white">{overallPct}<span className="text-sm text-white/40">%</span></p>
                      <p className="text-[10px] text-white/35">Avg. Progress</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{completed.length}</p>
                      <p className="text-[10px] text-white/35">Completed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{inProgress.length}</p>
                      <p className="text-[10px] text-white/35">In Progress</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Articles / Announcements */}
            <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={4}>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-serif font-bold text-white text-base">Recent Announcements</h2>
                  <Link to="/blog" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
                    View all <ArrowRight size={12} />
                  </Link>
                </div>
                {articlesLoading ? (
                  <div className="p-5 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (featuredArticles || []).length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-white/30 text-sm">No announcements yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {(featuredArticles || []).slice(0, 4).map((a) => (
                      <Link key={a.id} to={`/blog/${a.slug}`}>
                        <div className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-white/2 transition-colors group">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors overflow-hidden">
                            {a.cover_image_url
                              ? <img src={a.cover_image_url} alt={a.title} className="w-full h-full object-cover" />
                              : <Newspaper size={16} className="text-primary/60" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white leading-snug line-clamp-1 group-hover:text-primary transition-colors">{a.title}</p>
                            {a.excerpt && (
                              <p className="text-xs text-white/35 line-clamp-1 mt-0.5 leading-snug">{a.excerpt}</p>
                            )}
                            <p className="text-[11px] text-white/30 mt-1">{a.author_name || "HTB Team"} · {formatDate(a.created_at)}</p>
                          </div>
                          <ChevronRight size={14} className="text-white/20 group-hover:text-primary transition-colors shrink-0 mt-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>

          </div>

          {/* ── RIGHT column ────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Quick Actions */}
            <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
              <div className="rounded-2xl bg-card border border-border p-5">
                <h3 className="font-serif font-bold text-white text-base mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {QUICK_ACTIONS.map((a) => (
                    <Link key={a.path} to={a.path}>
                      <div className={`rounded-xl border ${a.bg} p-3.5 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200 cursor-pointer group`}>
                        <a.icon size={20} className={a.color} />
                        <span className={`text-[11px] font-semibold ${a.color} text-center leading-tight`}>{a.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Upcoming Sessions */}
            <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-serif font-bold text-white text-base">Upcoming Sessions</h3>
                  <Link to="/mentors" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
                    Book <ArrowRight size={12} />
                  </Link>
                </div>
                {bookingsLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <CalendarDays size={28} className="text-white/15 mx-auto mb-2" />
                    <p className="text-xs text-white/35 mb-3">No upcoming sessions.</p>
                    <Button asChild size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10">
                      <Link to="/mentors">Book a Mentor</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {upcomingSessions.map((b: any) => {
                      const d = new Date(b.session_date);
                      return (
                        <div key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-purple-400 uppercase">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
                            <span className="text-sm font-bold text-white leading-none">{d.getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {b.mentor_name || "Mentor Session"}
                            </p>
                            <p className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> {formatTime(b.start_time)} – {formatTime(b.end_time)}
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${
                            b.status === "confirmed"
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          }`}>
                            {b.status === "confirmed" ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="px-5 py-3 border-t border-border/40">
                  <Link to="/mentors" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
                    View full schedule <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </motion.section>

            {/* Recommended Courses */}
            <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={4}>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-serif font-bold text-white text-base">Recommended</h3>
                  <Link to="/courses" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
                    View all <ArrowRight size={12} />
                  </Link>
                </div>
                {coursesLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {(courses || []).slice(0, 4).map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() => c.is_locked
                          ? setLockedCourse({ title: c.title, category: c.category })
                          : navigate(`/course/${c.id}`)
                        }
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                          {c.thumbnail_url
                            ? <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                            : <BookOpen size={14} className="text-white/20" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-primary transition-colors">{c.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-white/35">{c.category}</span>
                            <span className="text-[10px] font-bold text-primary">{c.price > 0 ? `£${c.price}` : "Free"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-[11px] text-white/40">{c.rating || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>

          </div>
        </div>
      </div>

      {/* ── Locked Course Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {lockedCourse && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setLockedCourse(null)} />
            <motion.div
              className="relative glass-dark border border-amber-500/25 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center glow-gold"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button onClick={() => setLockedCourse(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                <X size={18} />
              </button>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-amber-400" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Course Locked</h3>
              <p className="text-white/60 text-sm mb-2">
                <strong className="text-white">{lockedCourse.title}</strong> is currently locked.
              </p>
              <p className="text-white/40 text-xs mb-6">
                This course will be available soon. Contact support for more information.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setLockedCourse(null)} className="text-white/60 hover:text-white hover:bg-white/10">
                  Close
                </Button>
                <Button asChild className="bg-gradient-gold hover:opacity-90 btn-shimmer font-semibold">
                  <Link to="/contact" onClick={() => setLockedCourse(null)}>Contact Us</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Dashboard;
