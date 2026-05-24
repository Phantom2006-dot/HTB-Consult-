import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, Clock, Award, CheckCircle2, Play,
  ArrowRight, Trophy, Flame, Calendar, MoreVertical,
  GraduationCap, Lock, X, BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/use-courses";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useMyBookings } from "@/hooks/use-bookings";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import SidebarLayout from "@/components/SidebarLayout";

interface FeaturedArticle {
  id: string; title: string; slug: string; excerpt: string | null;
  cover_image_url: string | null; created_at: string; author_name: string | null;
}
interface DashStats {
  courses_in_progress: number; completed_courses: number;
  certificates_earned: number; completed_lessons: number;
  total_enrolled: number; active_days_30: number;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDay(d: string)  { return new Date(d).getDate(); }
function fmtMon(d: string)  {
  return new Date(d).toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
}
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

const PATH_STAGES = [
  { num: 1, label: "Foundation" },
  { num: 2, label: "Practical Application" },
  { num: 3, label: "Domain Specialisation" },
  { num: 4, label: "Industry Project & Mentorship" },
];

const CARD_ACCENTS = [
  "bg-[#1E3A5F]", "bg-[#4C1D95]", "bg-[#064E3B]", "bg-[#7C2D12]",
];

/* ══════════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [lockedCourse, setLockedCourse] = useState<{ title: string; category: string } | null>(null);

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

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
    </div>
  );
  if (!user) return null;

  /* ── computed ─────────────────────────────────────────────────────── */
  const enrolledCourses = (enrollmentsData || []).map((e: any) => ({
    ...e.courses,
    progress:    e.progress    ?? 0,
    completed:   e.completed   ?? false,
    enrolled_at: e.enrolled_at,
  }));

  const inProgress   = enrolledCourses.filter((c: any) => !c.completed && c.progress > 0);
  const completedArr = enrolledCourses.filter((c: any) => c.completed);
  const continueWith = inProgress[0] || null;

  const overallPct = enrolledCourses.length === 0 ? 0
    : Math.round(enrolledCourses.reduce((s: number, c: any) => s + (c.progress || 0), 0) / enrolledCourses.length);

  const upcomingSessions = (bookingsData || [])
    .filter((b: any) => b.session_date && new Date(b.session_date) >= new Date())
    .sort((a: any, b: any) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
    .slice(0, 3);

  const announcements = (featuredArticles || []).slice(0, 3);

  const achievements: { title: string; desc: string; xp: number; color: string }[] = [
    ...completedArr.slice(0, 2).map((c: any) => ({
      title: "Course Completed", desc: c.title || "Course", xp: 200, color: "bg-emerald-500",
    })),
    ...(stats && stats.completed_lessons >= 3 ? [{
      title: "Consistent Learner",
      desc: `${stats.active_days_30} active day${stats.active_days_30 !== 1 ? "s" : ""} this month`,
      xp: 100, color: "bg-purple-500",
    }] : []),
  ].slice(0, 2);

  const totalLearningMins = (stats?.completed_lessons ?? 0) * 45;
  const firstName = (user?.full_name || user?.email?.split("@")[0] || "User").split(" ")[0];
  const streakDays = stats?.active_days_30 ?? 0;

  const pathStages = PATH_STAGES.map((stage, i) => {
    const course = enrolledCourses[i];
    const status = !course ? "not-started"
      : course.completed ? "completed"
      : course.progress > 0 ? "in-progress"
      : "not-started";
    return { ...stage, course, status };
  });

  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <SidebarLayout>
      <div className="flex h-full min-h-full">

        {/* ── Main scroll ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-w-0">

          {/* Welcome + Streak */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Stay consistent and keep building the skills that shape your future.
              </p>
            </div>
            {streakDays > 0 && (
              <div className="shrink-0 flex items-center gap-2 bg-card rounded-xl border border-border px-4 py-2.5 shadow-sm">
                <Flame size={18} className="text-orange-500" />
                <div>
                  <p className="text-xl font-bold text-foreground leading-tight">{streakDays}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Day Streak</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Stat Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Courses in Progress */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <BookOpen size={18} className="text-blue-500" />
              </div>
              {statsLoading || enrollmentsLoading
                ? <Skeleton className="h-8 w-12 mb-1" />
                : <p className="text-2xl font-bold text-foreground">{stats?.courses_in_progress ?? inProgress.length}</p>
              }
              <p className="text-xs text-muted-foreground mb-2">Courses in Progress</p>
              <Link to="/my-learning" className="text-xs text-blue-500 font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>

            {/* Completed Lessons */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 size={18} className="text-green-500" />
              </div>
              {statsLoading
                ? <Skeleton className="h-8 w-12 mb-1" />
                : <p className="text-2xl font-bold text-foreground">{stats?.completed_lessons ?? 0}</p>
              }
              <p className="text-xs text-muted-foreground mb-2">Completed Lessons</p>
              <Link to="/my-learning" className="text-xs text-green-500 font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>

            {/* Total Learning Time */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
                <Clock size={18} className="text-orange-500" />
              </div>
              {statsLoading
                ? <Skeleton className="h-8 w-16 mb-1" />
                : <p className="text-2xl font-bold text-foreground">{fmtLearningTime(totalLearningMins)}</p>
              }
              <p className="text-xs text-muted-foreground mb-2">Total Learning Time</p>
              <Link to="/my-learning" className="text-xs text-orange-500 font-semibold hover:underline flex items-center gap-1">
                View stats <ArrowRight size={11} />
              </Link>
            </div>

            {/* Certificates */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                <Award size={18} className="text-purple-500" />
              </div>
              {statsLoading
                ? <Skeleton className="h-8 w-8 mb-1" />
                : <p className="text-2xl font-bold text-foreground">{stats?.certificates_earned ?? 0}</p>
              }
              <p className="text-xs text-muted-foreground mb-2">Certificates Earned</p>
              <Link to="/my-learning" className="text-xs text-purple-500 font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
          </div>

          {/* ── Continue Learning ───────────────────────────────────── */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-1">
              <h2 className="text-sm font-bold text-foreground">Continue Learning</h2>
            </div>
            {enrollmentsLoading ? (
              <div className="p-5"><Skeleton className="h-32 w-full rounded-xl" /></div>
            ) : !continueWith ? (
              <div className="px-5 pb-5 pt-2 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-44 h-28 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <BookOpen size={28} className="text-muted-foreground/30" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-3">You haven't started any courses yet.</p>
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    <Link to="/explore">Browse Courses</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-5 pb-5 pt-2 flex flex-col sm:flex-row gap-4 items-start">
                {/* Thumbnail */}
                <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-[#0D2137] relative shrink-0 flex items-center justify-center">
                  {continueWith.thumbnail_url
                    ? <img src={continueWith.thumbnail_url} alt={continueWith.title} className="w-full h-full object-cover opacity-70" />
                    : <BookMarked size={32} className="text-white/30" />
                  }
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center backdrop-blur-sm">
                      <Play size={14} className="text-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                    In Progress
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-base leading-snug mb-0.5 line-clamp-2">
                    {continueWith.title}
                  </h3>
                  {continueWith.category && (
                    <p className="text-xs text-muted-foreground mb-3">{continueWith.category}</p>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-700"
                        style={{ width: `${continueWith.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-blue-600 shrink-0">
                      {continueWith.progress || 0}% Complete
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
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
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      View Course <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── My Learning Path ────────────────────────────────────── */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-foreground">My Learning Path</h2>
              <Link to="/services" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View Pathway <ArrowRight size={11} />
              </Link>
            </div>
            <div className="relative flex items-start justify-between gap-2">
              <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-border z-0" />
              {pathStages.map((stage) => {
                const isCompleted  = stage.status === "completed";
                const isActive     = stage.status === "in-progress";
                return (
                  <div key={stage.num} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                    <div className={`
                      w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                      ${isCompleted ? "bg-green-500 border-green-500 text-white"
                        : isActive   ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-card border-border text-muted-foreground"}
                    `}>
                      {isCompleted
                        ? <CheckCircle2 size={18} />
                        : <span className="text-sm font-bold">{stage.num}</span>
                      }
                    </div>
                    <div className="text-center">
                      <p className={`text-[10px] font-bold leading-tight text-center ${
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-muted-foreground"
                      }`}>{stage.label}</p>
                      <p className={`text-[9px] mt-0.5 font-medium ${
                        isCompleted ? "text-green-500" : isActive ? "text-blue-500" : "text-muted-foreground/60"
                      }`}>
                        {isCompleted ? "Completed" : isActive ? "In Progress" : "Not Started"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Your Courses ────────────────────────────────────────── */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground">Your Courses</h2>
              <Link to="/my-learning" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View all courses <ArrowRight size={11} />
              </Link>
            </div>

            {enrollmentsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0,1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm mb-3">No courses enrolled yet.</p>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link to="/explore">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {enrolledCourses.slice(0, 3).map((course: any, i: number) => {
                    const accentBg = CARD_ACCENTS[i % CARD_ACCENTS.length];
                    const isInProgress = !course.completed && course.progress > 0;
                    const isCmpl = course.completed;
                    return (
                      <div
                        key={course.id}
                        className="rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => course.is_locked
                          ? setLockedCourse({ title: course.title, category: course.category })
                          : navigate(`/course/${course.id}`)
                        }
                      >
                        <div className={`${accentBg} p-4 flex items-start justify-between`}>
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
                            {course.thumbnail_url
                              ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                              : <GraduationCap size={18} className="text-white" />
                            }
                          </div>
                          <button className="text-white/60 hover:text-white p-0.5" onClick={e => e.stopPropagation()}>
                            <MoreVertical size={14} />
                          </button>
                        </div>
                        <div className="p-3 bg-card">
                          <p className="text-xs font-bold text-foreground leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                            {course.title}
                          </p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 ${
                            isCmpl        ? "bg-green-500/10 text-green-600"
                            : isInProgress ? "bg-blue-500/10 text-blue-600"
                            : course.is_locked ? "bg-amber-500/10 text-amber-600"
                            : "bg-muted text-muted-foreground"
                          }`}>
                            {isCmpl ? "Completed" : isInProgress ? "In Progress" : course.is_locked ? "Locked" : "Not Started"}
                          </span>
                          <div className="h-1.5 rounded-full bg-muted mb-1.5">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${isCmpl ? "bg-green-500" : "bg-blue-500"}`}
                              style={{ width: `${Math.max(course.progress || 0, isCmpl ? 100 : 0)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={9} />
                              ~{course.duration_hours ? `${course.duration_hours}h` : "—"}
                            </span>
                            <span className="font-semibold text-foreground">
                              {isCmpl ? 100 : course.progress || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-border text-center">
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Browse All Courses <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>

        {/* ── Right Panel ─────────────────────────────────────────────── */}
        <aside className="w-72 shrink-0 border-l border-border bg-card overflow-y-auto p-5 space-y-6 hidden xl:block">

          {/* Announcements */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Announcements</h3>
              <Link to="/blog" className="text-xs text-primary font-semibold hover:underline">View all</Link>
            </div>
            {articlesLoading ? (
              <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-muted-foreground">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a, i) => {
                  const dotColors = ["bg-blue-500", "bg-green-500", "bg-slate-400"];
                  return (
                    <Link key={a.id} to={`/blog/${a.slug}`} className="block group">
                      <div className="flex gap-2.5 items-start">
                        <div className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]} mt-1.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {a.title}
                          </p>
                          {a.excerpt && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{a.excerpt}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Calendar size={9} /> {fmtDate(a.created_at)}
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
              <h3 className="text-sm font-bold text-foreground">Upcoming Live Sessions</h3>
              <Link to="/mentors" className="text-xs text-primary font-semibold hover:underline">View all</Link>
            </div>
            {bookingsLoading ? (
              <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-4">
                <Calendar size={22} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-2">No upcoming sessions.</p>
                <Link to="/mentors" className="text-xs font-semibold text-primary hover:underline">Book a session →</Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {upcomingSessions.map((b: any) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <div className="shrink-0 w-11 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center py-1.5">
                        <span className="text-base font-bold text-primary leading-tight">{fmtDay(b.session_date)}</span>
                        <span className="text-[9px] font-bold text-primary/60 uppercase">{fmtMon(b.session_date)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{b.mentor_name || "Live Session"}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={9} /> {fmtTime(b.session_date)} (SAST)
                        </p>
                      </div>
                      {b.meeting_link ? (
                        <a href={b.meeting_link} target="_blank" rel="noreferrer"
                          className="shrink-0 text-[10px] font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-2.5 py-1.5 transition-colors"
                          onClick={e => e.stopPropagation()}>Join</a>
                      ) : (
                        <Link to="/mentors"
                          className="shrink-0 text-[10px] font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-2.5 py-1.5 transition-colors">Join</Link>
                      )}
                    </div>
                  ))}
                </div>
                <Link to="/mentors" className="mt-3 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                  View Full Schedule <ArrowRight size={11} />
                </Link>
              </>
            )}
          </section>

          {/* Recent Achievements */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Recent Achievements</h3>
              <Link to="/my-learning" className="text-xs text-primary font-semibold hover:underline">View all</Link>
            </div>
            {achievements.length === 0 ? (
              <div className="text-center py-4">
                <Trophy size={22} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Complete lessons to earn achievements!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.map((ach, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${ach.color} flex items-center justify-center shrink-0`}>
                      <Trophy size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{ach.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{ach.desc}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
                      +{ach.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </aside>
      </div>

      {/* ── Locked Course Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {lockedCourse && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLockedCourse(null)} />
            <motion.div
              className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-7 text-center z-10"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button onClick={() => setLockedCourse(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X size={17} />
              </button>
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Lock size={26} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Course Locked</h3>
              <p className="text-muted-foreground text-sm mb-2">
                <strong className="text-foreground">{lockedCourse.title}</strong> is currently locked.
              </p>
              <p className="text-muted-foreground text-xs mb-5">
                This course will be available soon. Contact us for more information.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setLockedCourse(null)}>Close</Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link to="/contact" onClick={() => setLockedCourse(null)}>Contact Us</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
};

export default Dashboard;
