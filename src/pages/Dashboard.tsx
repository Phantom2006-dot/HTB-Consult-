import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Star, Bookmark,
  BarChart3, GraduationCap, Award, Users, FileText, Play
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
import { useQuery } from "@tanstack/react-query";

const categories = [
  { icon: Award, label: "Certificates" },
  { icon: Users, label: "Mentorship" },
  { icon: FileText, label: "Templates" },
  { icon: BarChart3, label: "Career Tools" },
  { icon: GraduationCap, label: "Workshops" },
  { icon: BookOpen, label: "Resources" },
];

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

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Welcome */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, <span className="text-primary font-semibold">{displayName}</span></p>
        </motion.div>

        {/* Featured Courses */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={1}>
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
          <h2 className="text-xl font-serif font-bold text-foreground mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <cat.icon size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs font-medium text-foreground">{cat.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
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