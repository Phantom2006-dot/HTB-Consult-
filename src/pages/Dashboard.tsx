import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Star,
  BarChart3, GraduationCap, Award, Users, Briefcase,
  Play, Layers, Globe, Target, FileText, TrendingUp, Cpu, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
import Layout from "@/components/Layout";
import { useCourses } from "@/hooks/use-courses";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useCategories } from "@/hooks/use-categories";
import { useQuery } from "@tanstack/react-query";

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

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => ({ full_name: user?.full_name, avatar_url: user?.avatar_url, bio: user?.bio }),
    enabled: !!user,
  });

  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const enrolledCourses = (enrollmentsData || []).map((e: any) => ({
    ...e.courses,
    progress: e.progress,
    enrolled_at: e.enrolled_at,
  }));

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
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

        {/* Featured Courses */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
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
                <Link key={course.id} to={`/course/${course.id}`}>
                  <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group h-full">
                    <CardContent className="p-4">
                      <div className="h-32 bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <BookOpen size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <h3 className="font-sans font-semibold text-sm text-foreground mb-2 line-clamp-1">{course.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.total_duration || "—"}</span>
                          <span className="flex items-center gap-1"><Star size={12} className="text-accent" /> {course.rating}/5</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{course.price > 0 ? `£${course.price}` : "Free"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </motion.section>

        {/* Categories */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
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
              {(categoriesData || []).filter(c => c.name !== "General").map((cat) => {
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
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3}>
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
                You haven't enrolled in any courses yet. <Link to="/explore" className="text-primary hover:underline">Explore courses</Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map((item: any) => (
                <Link key={item.id} to={`/course/${item.id}`}>
                  <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Play size={28} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-sans font-semibold text-sm text-foreground line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{item.category}</p>
                        <Progress value={item.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{item.progress}% complete</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </Layout>
  );
};

export default Dashboard;