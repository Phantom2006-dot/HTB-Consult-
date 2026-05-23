import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, Star,
  BarChart3, GraduationCap, Award, Users, Briefcase,
  Play, Layers, Globe, Target, FileText, TrendingUp, Cpu, FolderOpen,
  Newspaper, ArrowRight, Lock, X, Sparkles, ChevronRight,
  Compass, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp, scaleIn } from "@/lib/animations";
import Layout from "@/components/Layout";
import { useCourses } from "@/hooks/use-courses";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useCategories } from "@/hooks/use-categories";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Business Analysis": BarChart3,
  "Project Management": Briefcase,
  "Agile & Scrum": Layers,
  "Digital Transformation": Globe,
  "Business Strategy": Target,
  "Project Delivery": GraduationCap,
  "Bid Writing": FileText,
  "Consulting & Leadership": Users,
  "Data Analysis": TrendingUp,
  "Leadership": Award,
  "Finance & Accounting": BarChart3,
  "Marketing": Star,
  "IT & Technology": Cpu,
  "General": FolderOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Business Analysis": "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
  "Project Management": "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
  "Agile & Scrum": "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
  "Digital Transformation": "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
  "Business Strategy": "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
  "Project Delivery": "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
  "Bid Writing": "from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400",
  "Consulting & Leadership": "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400",
  "Data Analysis": "from-teal-500/20 to-teal-600/5 border-teal-500/20 text-teal-400",
};

interface FeaturedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  read_time_minutes: number;
  is_featured: boolean;
  created_at: string;
  author_name: string | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [lockedCourse, setLockedCourse] = useState<{ title: string; category: string } | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => ({ full_name: user?.full_name, avatar_url: user?.avatar_url, bio: user?.bio }),
    enabled: !!user,
  });

  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: featuredArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["featured-articles"],
    queryFn: () => api.get<FeaturedArticle[]>("/api/articles/featured"),
  });

  const enrolledCourses = (enrollmentsData || []).map((e: any) => ({
    ...e.courses,
    progress: e.progress,
    enrolled_at: e.enrolled_at,
  }));

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

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const featuredCourses = (courses || []).slice(0, 4);
  const inProgress = enrolledCourses.filter((e: any) => !e.completed && e.progress > 0);
  const completed = enrolledCourses.filter((e: any) => e.completed);

  const learningStats = [
    {
      label: "Enrolled",
      value: enrolledCourses.length,
      icon: BookOpen,
      gradient: "from-blue-600/25 to-blue-500/5",
      border: "border-blue-500/20",
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
      glow: "hover:shadow-[0_8px_30px_-5px_rgba(59,130,246,0.25)]",
      accent: "text-blue-400",
    },
    {
      label: "In Progress",
      value: inProgress.length,
      icon: Clock,
      gradient: "from-amber-600/25 to-amber-500/5",
      border: "border-amber-500/20",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      glow: "hover:shadow-[0_8px_30px_-5px_rgba(245,158,11,0.25)]",
      accent: "text-amber-400",
    },
    {
      label: "Completed",
      value: completed.length,
      icon: GraduationCap,
      gradient: "from-emerald-600/25 to-emerald-500/5",
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      glow: "hover:shadow-[0_8px_30px_-5px_rgba(16,185,129,0.25)]",
      accent: "text-emerald-400",
    },
    {
      label: "Certificates",
      value: completed.length,
      icon: Award,
      gradient: "from-primary/20 to-primary/5",
      border: "border-primary/20",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      glow: "hover:shadow-[0_8px_30px_-5px_var(--accent-glow)]",
      accent: "text-primary",
    },
  ];

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">

        {/* ── Welcome Banner ─────────────────────────────────────────────── */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="relative rounded-2xl overflow-hidden border border-white/8"
          style={{ background: "hsl(var(--hero-gradient-from))" }}
        >
          <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-blue-500/8 blur-[60px] pointer-events-none" />

          <div className="relative z-10 p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/25 flex items-center justify-center shrink-0 shadow-lg">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span className="text-lg font-bold text-primary">{getInitials(displayName)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={13} className="text-primary/70" />
                  <span className="text-xs text-primary/70 uppercase tracking-widest font-medium">Welcome back</span>
                </div>
                <h1 className="text-xl lg:text-2xl font-serif font-bold text-white leading-tight">
                  {displayName} 👋
                </h1>
                <p className="text-sm text-white/45 mt-0.5">Continue your professional development journey</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/8 gap-1.5">
                <Link to="/notifications"><Bell size={15} /> Notifications</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-gold hover:opacity-90 gap-1.5 btn-shimmer font-semibold">
                <Link to="/explore"><Compass size={14} /> Browse Courses</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4"
        >
          {learningStats.map((s, i) => (
            <motion.div key={s.label} initial="hidden" animate="visible" variants={scaleIn} custom={i * 0.1}>
              <div className={`relative rounded-2xl bg-gradient-to-br ${s.gradient} border ${s.border} ${s.glow} transition-all duration-300 p-5 overflow-hidden group cursor-default`}>
                {/* Subtle inner glow */}
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-current" style={{ color: "inherit" }} />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center border border-white/8`}>
                    <s.icon size={18} className={s.iconColor} />
                  </div>
                  <div>
                    {enrollmentsLoading ? (
                      <Skeleton className="h-8 w-10 mb-1" />
                    ) : (
                      <p className={`text-3xl font-bold ${s.accent}`}>{s.value}</p>
                    )}
                    <p className="text-[12px] text-white/50 font-medium mt-0.5">{s.label}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── My Progress ─────────────────────────────────────────────────── */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-amber-400" />
              My Progress
            </h2>
            {enrolledCourses.length > 0 && (
              <Link to="/my-learning" className="flex items-center gap-1 text-sm text-primary hover:opacity-80 transition-opacity font-medium">
                View all <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="bg-card border-border"><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="relative rounded-2xl border border-white/8 overflow-hidden p-8 text-center"
              style={{ background: "hsl(var(--section-alt))" }}>
              <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={22} className="text-primary/60" />
                </div>
                <p className="text-white/50 text-sm mb-3">You haven't enrolled in any courses yet.</p>
                <Button asChild size="sm" className="bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer">
                  <Link to="/explore">Explore Courses</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map((item: any) => (
                <div
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => item.is_locked
                    ? setLockedCourse({ title: item.title, category: item.category })
                    : navigate(`/course/${item.id}`)
                  }
                >
                  <div className={`relative rounded-2xl border transition-all duration-300 overflow-hidden group ${
                    item.is_locked
                      ? "border-white/5 opacity-65"
                      : "border-white/8 hover:border-primary/30 card-lift"
                  }`} style={{ background: "hsl(var(--card))" }}>
                    {!item.is_locked && (
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title}
                            className={`w-full h-full object-cover rounded-xl ${item.is_locked ? "grayscale" : "group-hover:scale-105 transition-transform duration-500"}`} />
                        ) : (
                          <Play size={28} className="text-white/20" />
                        )}
                        {item.is_locked && (
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <Lock size={16} className="text-amber-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm text-white line-clamp-1">{item.title}</h3>
                          {item.is_locked && <Lock size={11} className="text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-white/40 mb-3">{item.category}</p>
                        {item.is_locked ? (
                          <p className="text-xs text-amber-500/80 font-medium flex items-center gap-1">
                            <Lock size={11} /> Currently locked
                          </p>
                        ) : (
                          <>
                            <div className="relative h-1.5 rounded-full bg-white/6 overflow-hidden mb-1.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-white/35">{item.progress}% complete</p>
                              <span className="text-xs text-primary font-medium flex items-center gap-1">
                                Continue <ChevronRight size={11} />
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Featured Courses ──────────────────────────────────────────── */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-amber-400" />
              Featured Courses
            </h2>
            <Link to="/courses" className="flex items-center gap-1 text-sm text-primary hover:opacity-80 transition-opacity font-medium">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-card border-border rounded-2xl">
                  <CardContent className="p-4"><Skeleton className="h-32 rounded-xl mb-3" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></CardContent>
                </Card>
              ))}
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="relative rounded-2xl border border-white/8 p-8 text-center text-white/40"
              style={{ background: "hsl(var(--section-alt))" }}>
              No courses available yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCourses.map((course: any) => (
                <div
                  key={course.id}
                  className="cursor-pointer card-lift group"
                  onClick={() => course.is_locked
                    ? setLockedCourse({ title: course.title, category: course.category })
                    : navigate(`/course/${course.id}`)
                  }
                >
                  <div className={`relative rounded-2xl border transition-all duration-300 h-full overflow-hidden ${
                    course.is_locked
                      ? "border-white/6 opacity-65"
                      : "border-white/8 hover:border-primary/30"
                  }`} style={{ background: "hsl(var(--card))" }}>
                    {!course.is_locked && (
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <div className="p-4">
                      <div className="h-32 bg-muted rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title}
                            className={`w-full h-full object-cover rounded-xl ${course.is_locked ? "grayscale" : "group-hover:scale-105 transition-transform duration-500"}`} />
                        ) : (
                          <BookOpen size={32} className="text-white/20 group-hover:text-primary transition-colors" />
                        )}
                        {course.is_locked && (
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <Lock size={20} className="text-amber-400" />
                          </div>
                        )}
                        {!course.is_locked && (
                          <div className="absolute top-2 right-2">
                            <span className="text-xs font-bold text-white bg-primary/80 px-2 py-0.5 rounded-lg">
                              {course.price > 0 ? `£${course.price}` : "Free"}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-white mb-2 line-clamp-2 leading-snug">{course.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Clock size={11} /> {course.total_duration || "—"}</span>
                        {course.is_locked
                          ? <span className="flex items-center gap-1 text-amber-500/80"><Lock size={11} /> Locked</span>
                          : <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /> {course.rating || 0}/5</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Browse Categories ────────────────────────────────────────── */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-amber-400" />
              Browse Categories
            </h2>
          </div>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Card key={i} className="bg-card border-border rounded-2xl">
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {(categoriesData || [])
                .filter((c: any) => c.name !== "General")
                .sort((a: any, b: any) => {
                  const priority = ["Business Analysis", "Business Strategy"];
                  const ai = priority.indexOf(a.name);
                  const bi = priority.indexOf(b.name);
                  if (ai !== -1 && bi !== -1) return ai - bi;
                  if (ai !== -1) return -1;
                  if (bi !== -1) return 1;
                  return 0;
                })
                .map((cat: any) => {
                  const Icon = CATEGORY_ICONS[cat.name] || FolderOpen;
                  const colorClass = CATEGORY_COLORS[cat.name] || "from-white/10 to-white/5 border-white/10 text-white/60";
                  const [gradFrom, gradTo, border, iconColor] = colorClass.split(" ");
                  return (
                    <Link key={cat.id} to={`/courses?category=${encodeURIComponent(cat.name)}`}>
                      <div className={`rounded-2xl bg-gradient-to-br ${gradFrom} ${gradTo} border ${border} hover:scale-105 transition-all duration-300 cursor-pointer group p-4 flex flex-col items-center gap-2.5 card-lift`}>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <Icon size={20} className={iconColor} />
                        </div>
                        <span className="text-xs font-semibold text-white/65 text-center leading-tight group-hover:text-white transition-colors">{cat.name}</span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </motion.section>

        {/* ── Featured Articles ─────────────────────────────────────────── */}
        {(articlesLoading || (featuredArticles && featuredArticles.length > 0)) && (
          <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-amber-400" />
                From the Blog
              </h2>
              <Link to="/blog" className="flex items-center gap-1 text-sm text-primary hover:opacity-80 transition-opacity font-medium">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {articlesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-card border-border rounded-2xl overflow-hidden">
                    <Skeleton className="h-36 w-full rounded-none" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(featuredArticles || []).map((article) => (
                  <Link key={article.id} to={`/blog/${article.slug}`}>
                    <div className="rounded-2xl border border-white/8 hover:border-primary/30 transition-all duration-300 card-lift overflow-hidden h-full group"
                      style={{ background: "hsl(var(--card))" }}>
                      {article.cover_image_url ? (
                        <div className="overflow-hidden h-36">
                          <img src={article.cover_image_url} alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="h-36 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent flex items-center justify-center">
                          <Newspaper size={28} className="text-primary/40" />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {article.is_featured && (
                            <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/25 border">Featured</Badge>
                          )}
                          <span className="text-[11px] text-white/40 flex items-center gap-1">
                            <Clock size={11} /> {article.read_time_minutes} min read
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-sm text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                        )}
                        <p className="text-[11px] text-white/35">
                          {article.author_name || "HTB Team"} · {formatDate(article.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>
        )}

      </div>

      {/* ── Locked Course Modal ─────────────────────────────────────────── */}
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
              <button onClick={() => setLockedCourse(null)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                    <Lock size={36} className="text-amber-400" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-amber-500/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Course Locked</h3>
              <p className="text-white/60 text-sm mb-2">
                <strong className="text-white">{lockedCourse.title}</strong> is currently locked.
              </p>
              <p className="text-white/40 text-xs mb-6">
                This course will be available soon. Check back later or contact support for more information.
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
