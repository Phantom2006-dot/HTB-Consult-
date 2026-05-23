import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, GraduationCap, Route, Video,
  ClipboardList, FolderOpen, Users, TrendingUp, Award,
  Globe, HelpCircle, Bell, MessageSquare, ChevronDown,
  Search, Menu, X, Lock, Clock, CheckCircle2, Play,
  ArrowRight, Trophy, Flame, Calendar, MoreVertical,
  BookMarked, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/use-courses";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useMyBookings } from "@/hooks/use-bookings";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface FeaturedArticle {
  id: string; title: string; slug: string; excerpt: string | null;
  cover_image_url: string | null; created_at: string; author_name: string | null;
}
interface DashStats {
  courses_in_progress: number; completed_courses: number;
  certificates_earned: number; completed_lessons: number;
  total_enrolled: number; active_days_30: number;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDay(d: string)  { return new Date(d).getDate(); }
function fmtMon(d: string)  { return new Date(d).toLocaleDateString("en-GB", { month: "short" }).toUpperCase(); }
function fmtTime(d: string) {
  const dt = new Date(d);
  return dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
}
function fmtLearningTime(minutes: number): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

/* ── Sidebar nav config ───────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",         path: "/dashboard" },
  { icon: BookOpen,        label: "My Learning",       path: "/my-learning" },
  { icon: GraduationCap,   label: "Courses",           path: "/courses" },
  { icon: Route,           label: "Learning Pathways", path: "/services" },
  { icon: Video,           label: "Live Sessions",     path: "/sessions" },
  { icon: ClipboardList,   label: "Assignments",       path: "/my-learning" },
  { icon: FolderOpen,      label: "Resources",         path: "/blog" },
  { icon: Users,           label: "Mentorship",        path: "/mentors" },
  { icon: TrendingUp,      label: "Progress",          path: "/my-learning" },
  { icon: Award,           label: "Certificates",      path: "/my-learning" },
  { icon: Globe,           label: "Community",         path: "/blog" },
  { icon: HelpCircle,      label: "Support",           path: "/contact" },
];

/* ── Learning path stage config ──────────────────────────────────────── */
const PATH_STAGES = [
  { num: 1, label: "Foundation" },
  { num: 2, label: "Practical Application" },
  { num: 3, label: "Domain Specialisation" },
  { num: 4, label: "Industry Project & Mentorship" },
];

/* ── Course card accent colours (cycle by index) ─────────────────────── */
const CARD_ACCENTS = [
  { bg: "bg-[#1E3A5F]", text: "text-white" },
  { bg: "bg-[#4C1D95]", text: "text-white" },
  { bg: "bg-[#064E3B]", text: "text-white" },
  { bg: "bg-[#7C2D12]", text: "text-white" },
];

/* ══════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lockedCourse, setLockedCourse] = useState<{ title: string; category: string } | null>(null);

  /* ── data ──────────────────────────────────────────────────────────── */
  const { data: courses } = useCourses();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: bookingsData, isLoading: bookingsLoading } = useMyBookings();
  const { data: featuredArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["featured-articles"],
    queryFn: () => api.get<FeaturedArticle[]>("/api/articles/featured"),
  });
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashStats>("/api/dashboard/stats"),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  /* ── computed ─────────────────────────────────────────────────────── */
  const enrolledCourses = (enrollmentsData || []).map((e: any) => ({
    ...e.courses,
    progress:    e.progress    ?? 0,
    completed:   e.completed   ?? false,
    enrolled_at: e.enrolled_at,
  }));

  const inProgress   = enrolledCourses.filter((c: any) => !c.completed && c.progress > 0);
  const completed    = enrolledCourses.filter((c: any) => c.completed);
  const notStarted   = enrolledCourses.filter((c: any) => !c.completed && c.progress === 0);
  const continueWith = inProgress[0] || null;

  const overallPct = enrolledCourses.length === 0 ? 0
    : Math.round(enrolledCourses.reduce((s: number, c: any) => s + (c.progress || 0), 0) / enrolledCourses.length);

  const upcomingSessions = (bookingsData || [])
    .filter((b: any) => b.session_date && new Date(b.session_date) >= new Date())
    .sort((a: any, b: any) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
    .slice(0, 3);

  const announcements = (featuredArticles || []).slice(0, 3);

  const achievements: { title: string; desc: string; xp: number; color: string }[] = [
    ...completed.slice(0, 2).map((c: any) => ({
      title: "Course Completed",
      desc: c.title || "Course",
      xp: 200,
      color: "bg-emerald-500",
    })),
    ...(stats && stats.completed_lessons >= 3 ? [{
      title: "Consistent Learner",
      desc: `${stats.active_days_30} active day${stats.active_days_30 !== 1 ? "s" : ""} this month`,
      xp: 100,
      color: "bg-purple-500",
    }] : []),
  ].slice(0, 2);

  const totalLearningMins = (stats?.completed_lessons ?? 0) * 45;
  const firstName = (user?.full_name || user?.email?.split("@")[0] || "User").split(" ")[0];
  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const streakDays = stats?.active_days_30 ?? 0;

  /* ── path stages ──────────────────────────────────────────────────── */
  const pathStages = PATH_STAGES.map((stage, i) => {
    const course = enrolledCourses[i];
    const status = !course ? "not-started"
      : course.completed ? "completed"
      : course.progress > 0 ? "in-progress"
      : "not-started";
    return { ...stage, course, status };
  });

  /* ── loading / guard ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }
  if (!user) return null;

  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8]">

      {/* ── Mobile overlay ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR                                                      */}
      {/* ════════════════════════════════════════════════════════════ */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-56 flex flex-col
        transition-transform duration-300 bg-[#0B1C18] shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-tight tracking-wide">HTB ACADEMY</p>
            <p className="text-white/35 text-[9px] tracking-wider uppercase leading-tight">Mindset Before Skillset</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-orange-500/15 text-orange-400 border-r-2 border-orange-400"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"}
                `}
              >
                <item.icon size={16} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom progress card */}
        <div className="m-3 rounded-xl bg-[#0D2A22] border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Trophy size={14} className="text-orange-400" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-tight">Keep going, {firstName}!</p>
              <p className="text-white/40 text-[10px]">You're doing great.</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 mb-1.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
              style={{ width: `${Math.max(overallPct, 5)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/35 text-[10px]">{overallPct}% towards your goal</span>
            <span className="text-orange-400 text-[10px] font-semibold">{overallPct}%</span>
          </div>
          <Link
            to="/my-learning"
            className="block text-center text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-lg py-1.5 transition-colors"
          >
            View My Progress
          </Link>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MAIN AREA                                                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top Header ──────────────────────────────────────────── */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 gap-3 shrink-0">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800 p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search courses, modules, resources..."
                className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none flex-1 min-w-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Bell */}
            <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={18} className="text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
            </Link>
            {/* Messages */}
            <Link to="/messages" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <MessageSquare size={18} className="text-slate-500" />
            </Link>
            {/* User */}
            <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover rounded-full" />
                  : <span className="text-white text-xs font-bold">{getInitials(displayName)}</span>
                }
              </div>
              <div className="hidden sm:block">
                <p className="text-slate-800 text-xs font-semibold leading-tight">{displayName.split(" ").slice(0, 2).join(" ")}</p>
                <p className="text-slate-400 text-[10px] capitalize">{user.role || "Learner"}</p>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </Link>
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* ── Main scroll ──────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto p-5 space-y-5 min-w-0">

            {/* Welcome + Streak */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Welcome back, {firstName}! 👋
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Stay consistent and keep building the skills that shape your future.
                </p>
              </div>
              {streakDays > 0 && (
                <div className="shrink-0 flex items-center gap-2 bg-white rounded-xl border border-orange-200 px-4 py-2.5 shadow-sm">
                  <Flame size={20} className="text-orange-500" />
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-800 leading-tight">{streakDays}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Day Streak</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Stat Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Courses in Progress */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <BookOpen size={18} className="text-blue-600" />
                </div>
                {statsLoading || enrollmentsLoading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{stats?.courses_in_progress ?? inProgress.length}</p>
                )}
                <p className="text-xs text-slate-500 mb-2">Courses in Progress</p>
                <Link to="/my-learning" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>

              {/* Completed Lessons */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                  <CheckCircle2 size={18} className="text-green-600" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{stats?.completed_lessons ?? 0}</p>
                )}
                <p className="text-xs text-slate-500 mb-2">Completed Lessons</p>
                <Link to="/my-learning" className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>

              {/* Total Learning Time */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                  <Clock size={18} className="text-orange-600" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{fmtLearningTime(totalLearningMins)}</p>
                )}
                <p className="text-xs text-slate-500 mb-2">Total Learning Time</p>
                <Link to="/my-learning" className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
                  View stats <ArrowRight size={11} />
                </Link>
              </div>

              {/* Certificates */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                  <Award size={18} className="text-purple-600" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-8 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{stats?.certificates_earned ?? 0}</p>
                )}
                <p className="text-xs text-slate-500 mb-2">Certificates Earned</p>
                <Link to="/my-learning" className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* ── Continue Learning ─────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-sm font-bold text-slate-800">Continue Learning</h2>
              </div>
              {enrollmentsLoading ? (
                <div className="p-5">
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ) : !continueWith ? (
                <div className="px-5 pb-5 pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-44 h-28 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <BookOpen size={32} className="text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-3">You haven't started any courses yet.</p>
                    <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                      <Link to="/explore">Browse Courses</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="px-5 pb-5 pt-2 flex flex-col sm:flex-row gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-[#0D2137] relative shrink-0 flex items-center justify-center">
                    {continueWith.thumbnail_url ? (
                      <img src={continueWith.thumbnail_url} alt={continueWith.title} className="w-full h-full object-cover opacity-70" />
                    ) : (
                      <BookMarked size={36} className="text-white/30" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center backdrop-blur-sm">
                        <Play size={16} className="text-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                      In Progress
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base leading-snug mb-0.5 line-clamp-2">
                      {continueWith.title}
                    </h3>
                    {continueWith.category && (
                      <p className="text-xs text-slate-500 mb-3">{continueWith.category}</p>
                    )}

                    {/* Progress */}
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-700"
                          style={{ width: `${continueWith.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-blue-600 shrink-0">
                        {continueWith.progress || 0}% Complete
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        ~{Math.round((100 - (continueWith.progress || 0)) * 0.45)} mins left
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4"
                        onClick={() => navigate(`/course/${continueWith.id}`)}
                      >
                        Resume Learning
                      </Button>
                      <Link
                        to={`/course/${continueWith.id}`}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        View Course <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── My Learning Path ──────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-800">My Learning Path</h2>
                <Link to="/services" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  View Pathway <ArrowRight size={11} />
                </Link>
              </div>

              {/* Stages */}
              <div className="relative flex items-start justify-between gap-2">
                {/* Connecting line */}
                <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 z-0" />

                {pathStages.map((stage, i) => {
                  const isCompleted  = stage.status === "completed";
                  const isActive     = stage.status === "in-progress";
                  const isNotStarted = stage.status === "not-started";

                  return (
                    <div key={stage.num} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                      {/* Circle */}
                      <div className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                        ${isCompleted  ? "bg-green-500 border-green-500 text-white"
                          : isActive   ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white border-slate-300 text-slate-400"}
                      `}>
                        {isCompleted ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <span className="text-sm font-bold">{stage.num}</span>
                        )}
                      </div>
                      {/* Label */}
                      <div className="text-center">
                        <p className={`text-[10px] font-bold leading-tight text-center ${
                          isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-500"
                        }`}>
                          {stage.label}
                        </p>
                        <p className={`text-[9px] mt-0.5 font-medium ${
                          isCompleted  ? "text-green-500"
                            : isActive ? "text-blue-500"
                            : "text-slate-400"
                        }`}>
                          {isCompleted ? "Completed" : isActive ? "In Progress" : "Not Started"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Your Courses ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800">Your Courses</h2>
                <Link to="/my-learning" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  View all courses <ArrowRight size={11} />
                </Link>
              </div>

              {enrollmentsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[0,1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm mb-3">No courses enrolled yet.</p>
                  <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                    <Link to="/explore">Browse Courses</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {enrolledCourses.slice(0, 3).map((course: any, i: number) => {
                      const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
                      const isInProgress = !course.completed && course.progress > 0;
                      const isCmpl = course.completed;
                      return (
                        <div
                          key={course.id}
                          className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                          onClick={() => course.is_locked
                            ? setLockedCourse({ title: course.title, category: course.category })
                            : navigate(`/course/${course.id}`)
                          }
                        >
                          {/* Card header */}
                          <div className={`${accent.bg} p-4 flex items-start justify-between`}>
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                              {course.thumbnail_url
                                ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                                : <GraduationCap size={18} className="text-white" />
                              }
                            </div>
                            <button
                              className="text-white/60 hover:text-white p-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>

                          {/* Card body */}
                          <div className="p-3">
                            <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </p>

                            {/* Status badge */}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 ${
                              isCmpl       ? "bg-green-100 text-green-700"
                              : isInProgress ? "bg-blue-100 text-blue-700"
                              : course.is_locked ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                            }`}>
                              {isCmpl ? "Completed" : isInProgress ? "In Progress" : course.is_locked ? "Locked" : "Not Started"}
                            </span>

                            {/* Progress bar */}
                            <div className="h-1.5 rounded-full bg-slate-100 mb-1.5">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  isCmpl ? "bg-green-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${Math.max(course.progress || 0, isCmpl ? 100 : 0)}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock size={9} />
                                ~{course.duration_hours ? `${course.duration_hours}h` : "—"}
                              </span>
                              <span className="font-semibold text-slate-600">
                                {isCmpl ? 100 : course.progress || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <Link
                      to="/explore"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      Browse All Courses <ArrowRight size={14} />
                    </Link>
                  </div>
                </>
              )}
            </div>

          </main>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* RIGHT PANEL                                             */}
          {/* ═══════════════════════════════════════════════════════ */}
          <aside className="w-72 shrink-0 overflow-y-auto bg-white border-l border-slate-200 p-5 space-y-6 hidden xl:block">

            {/* Announcements */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Announcements</h3>
                <Link to="/blog" className="text-xs text-blue-600 font-semibold hover:underline">View all</Link>
              </div>
              {articlesLoading ? (
                <div className="space-y-3">
                  {[0,1,2].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                </div>
              ) : announcements.length === 0 ? (
                <p className="text-xs text-slate-400">No announcements yet.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a, i) => {
                    const dotColors = ["bg-blue-500", "bg-green-500", "bg-slate-400"];
                    return (
                      <Link key={a.id} to={`/blog/${a.slug}`} className="block group">
                        <div className="flex gap-2.5 items-start">
                          <div className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]} mt-1.5 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {a.title}
                            </p>
                            {a.excerpt && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{a.excerpt}</p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar size={9} />
                              {fmtDate(a.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Upcoming Live Sessions */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Upcoming Live Sessions</h3>
                <Link to="/mentors" className="text-xs text-blue-600 font-semibold hover:underline">View all</Link>
              </div>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[0,1,2].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-2">No upcoming sessions.</p>
                  <Link to="/mentors" className="text-xs font-semibold text-blue-600 hover:underline">
                    Book a session →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((b: any) => (
                    <div key={b.id} className="flex items-center gap-3">
                      {/* Date tile */}
                      <div className="shrink-0 w-11 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center py-1.5">
                        <span className="text-base font-bold text-blue-700 leading-tight">{fmtDay(b.session_date)}</span>
                        <span className="text-[9px] font-bold text-blue-400 uppercase">{fmtMon(b.session_date)}</span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {b.mentor_name || "Live Session"}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={9} /> {fmtTime(b.session_date)} (SAST)
                        </p>
                      </div>
                      {/* Join button */}
                      {b.meeting_link ? (
                        <a
                          href={b.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-[10px] font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-2.5 py-1.5 transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          Join
                        </a>
                      ) : (
                        <Link
                          to="/mentors"
                          className="shrink-0 text-[10px] font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-2.5 py-1.5 transition-colors"
                        >
                          Join
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {upcomingSessions.length > 0 && (
                <Link
                  to="/mentors"
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  View Full Schedule <ArrowRight size={11} />
                </Link>
              )}
            </section>

            {/* Recent Achievements */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Recent Achievements</h3>
                <Link to="/my-learning" className="text-xs text-blue-600 font-semibold hover:underline">View all</Link>
              </div>
              {achievements.length === 0 ? (
                <div className="text-center py-4">
                  <Trophy size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Complete lessons to earn achievements!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((ach, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${ach.color} flex items-center justify-center shrink-0`}>
                        <Trophy size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{ach.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{ach.desc}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
                        +{ach.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </aside>
        </div>
      </div>

      {/* ── Locked Course Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {lockedCourse && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLockedCourse(null)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 text-center z-10"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button onClick={() => setLockedCourse(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
              <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Course Locked</h3>
              <p className="text-slate-600 text-sm mb-2">
                <strong>{lockedCourse.title}</strong> is currently locked.
              </p>
              <p className="text-slate-400 text-xs mb-5">
                This course will be available soon. Contact us for more information.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setLockedCourse(null)} className="text-slate-600">
                  Close
                </Button>
                <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                  <Link to="/contact" onClick={() => setLockedCourse(null)}>Contact Us</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
