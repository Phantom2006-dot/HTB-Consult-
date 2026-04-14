import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, Star,
  BarChart3, GraduationCap, Award, Users, Briefcase,
  Play, Layers, Globe, Target, FileText, TrendingUp, Cpu, FolderOpen,
  Newspaper, ArrowRight, Lock, X, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
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
    { label: "Enrolled", value: enrolledCourses.length, icon: BookOpen, color: "text-primary" },
    { label: "In Progress", value: inProgress.length, icon: Clock, color: "text-blue-500" },
    { label: "Completed", value: completed.length, icon: GraduationCap, color: "text-green-500" },
    { label: "Certificates", value: completed.length, icon: Award, color: "text-amber-500" },
  ];

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Welcome */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1">
              Welcome back, <span className="text-primary">{displayName}</span>
            </h1>
            <p className="text-sm text-muted-foreground">Continue your professional development journey</p>
          </div>
          <Button asChild size="sm" className="bg-gradient-gold hover:opacity-90 gap-1.5 shrink-0">
            <Link to="/explore"><BookOpen size={14} /> Browse Courses</Link>
          </Button>
        </motion.div>

        {/* Learning Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {learningStats.map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon size={16} />
                </div>
                <div>
                  {enrollmentsLoading ? (
                    <Skeleton className="h-6 w-8 mb-0.5" />
                  ) : (
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Featured Articles */}
        {(articlesLoading || (featuredArticles && featuredArticles.length > 0)) && (
          <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <Newspaper size={20} className="text-primary" /> From the Blog
              </h2>
              <Link to="/blog" className="flex items-center gap-1 text-sm text-primary hover:opacity-80 transition-opacity">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {articlesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-card border-border overflow-hidden">
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
                    <Card className="bg-card border-border hover:border-primary/40 transition-colors group overflow-hidden h-full">
                      {article.cover_image_url ? (
                        <div className="overflow-hidden h-36">
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-36 bg-gradient-to-br from-primary/20 via-primary/5 to-muted flex items-center justify-center">
                          <Newspaper size={28} className="text-primary/40" />
                        </div>
                      )}
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {article.is_featured && (
                            <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30 border">
                              Featured
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock size={11} /> {article.read_time_minutes} min read
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{article.excerpt}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {article.author_name || "HTB Team"} · {formatDate(article.created_at)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Featured Courses */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <h2 className="text-xl font-serif font-bold text-foreground mb-4">Featured Courses</h2>
          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4"><Skeleton className="h-32 rounded-lg mb-3" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></CardContent>
                </Card>
              ))}
            </div>
          ) : featuredCourses.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                No courses available yet. Check back soon!
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCourses.map((course: any) => (
                <div
                  key={course.id}
                  className="cursor-pointer"
                  onClick={() => course.is_locked
                    ? setLockedCourse({ title: course.title, category: course.category })
                    : navigate(`/course/${course.id}`)
                  }
                >
                  <Card className={`bg-card border-border transition-colors h-full group ${course.is_locked ? "opacity-75" : "hover:border-primary/50 cursor-pointer"}`}>
                    <CardContent className="p-4">
                      <div className="h-32 bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className={`w-full h-full object-cover rounded-lg ${course.is_locked ? "grayscale" : ""}`} />
                        ) : (
                          <BookOpen size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                        {course.is_locked && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <Lock size={20} className="text-amber-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-sans font-semibold text-sm text-foreground mb-2 line-clamp-1">{course.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.total_duration || "—"}</span>
                          {course.is_locked
                            ? <span className="flex items-center gap-1 text-amber-500"><Lock size={11} /> Locked</span>
                            : <span className="flex items-center gap-1"><Star size={12} className="text-accent" /> {course.rating || 0}/5</span>
                          }
                        </div>
                        <span className="text-sm font-bold text-primary">{course.price > 0 ? `£${course.price}` : "Free"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Categories */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <h2 className="text-xl font-serif font-bold text-foreground mb-4">Browse Categories</h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {(categoriesData || []).filter((c: any) => c.name !== "General").map((cat: any) => {
                const Icon = CATEGORY_ICONS[cat.name] || FolderOpen;
                return (
                  <Link key={cat.id} to={`/courses?category=${encodeURIComponent(cat.name)}`}>
                    <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group h-full">
                      <CardContent className="p-4 flex flex-col items-center gap-2">
                        <Icon size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs font-medium text-foreground text-center leading-tight">{cat.name}</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* My Progress */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <h2 className="text-xl font-serif font-bold text-foreground mb-4">My Progress</h2>
          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="bg-card border-border"><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                You haven't enrolled in any courses yet.{" "}
                <Link to="/explore" className="text-primary hover:underline">Explore courses</Link>
              </CardContent>
            </Card>
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
                  <Card className={`border-border transition-colors ${item.is_locked ? "bg-card opacity-75" : "bg-card hover:border-primary/30"}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg shrink-0 flex items-center justify-center overflow-hidden relative">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className={`w-full h-full object-cover rounded-lg ${item.is_locked ? "grayscale" : ""}`} />
                        ) : (
                          <Play size={28} className="text-muted-foreground" />
                        )}
                        {item.is_locked && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <Lock size={16} className="text-amber-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-sans font-semibold text-sm text-foreground line-clamp-1">{item.title}</h3>
                          {item.is_locked && <Lock size={12} className="text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{item.category}</p>
                        {item.is_locked ? (
                          <p className="text-xs text-amber-500 font-medium flex items-center gap-1"><Lock size={11} /> Currently locked</p>
                        ) : (
                          <>
                            <Progress value={item.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{item.progress}% complete</p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Locked Course Modal */}
      <AnimatePresence>
        {lockedCourse && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLockedCourse(null)} />
            <motion.div
              className="relative bg-card border border-amber-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button onClick={() => setLockedCourse(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                    <Lock size={36} className="text-amber-500" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-amber-500/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500 mb-3">
                {lockedCourse.category}
              </Badge>
              <h2 className="text-xl font-serif font-bold text-foreground mb-2">This Course is Currently Locked</h2>
              <p className="text-sm text-muted-foreground font-medium mb-1">"{lockedCourse.title}"</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-6">
                Our team is preparing this course for you. It will be available again soon — please check back later or explore our other courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="gap-2 border-border text-sm" onClick={() => setLockedCourse(null)}>
                  <Bell size={14} /> Noted, I'll check back
                </Button>
                <Button className="bg-gradient-gold hover:opacity-90 text-sm gap-2" onClick={() => { setLockedCourse(null); navigate("/courses"); }}>
                  <BookOpen size={14} /> Browse Other Courses
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
