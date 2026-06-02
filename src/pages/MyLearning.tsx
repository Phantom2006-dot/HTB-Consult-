import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Play, Award, CheckCircle2, Trophy, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { fadeUp, scaleIn } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useEnrollments, useUpdateProgress } from "@/hooks/use-enrollments";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const MyLearning = () => {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { data: enrollments, isLoading } = useEnrollments();
  const { mutate: updateProgress, isPending: isUpdating } = useUpdateProgress();

  const { data: certificates = [] } = useQuery<{ course_id: string; verification_code: string; issued_at: string; course_title: string }[]>({
    queryKey: ["my-certificates"],
    queryFn: () => api.get("/api/certificates/my"),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </SidebarLayout>
    );
  }

  if (!user) return null;

  const allEnrollments = enrollments || [];
  const inProgress = allEnrollments.filter((e: any) => !e.completed);
  const completed = allEnrollments.filter((e: any) => e.completed);
  const certByCourseId = new Map(certificates.map((c) => [c.course_id, c]));

  const stats = [
    { icon: BookOpen,     label: "Enrolled",    value: String(allEnrollments.length), gradient: "from-blue-600/20 to-blue-500/5",    border: isDark ? "border-blue-500/20"    : "border-blue-200",    iconBg: isDark ? "bg-blue-500/15"    : "bg-blue-50",    iconColor: isDark ? "text-blue-400"    : "text-blue-600"    },
    { icon: CheckCircle2, label: "Completed",   value: String(completed.length),      gradient: "from-emerald-600/20 to-emerald-500/5", border: isDark ? "border-emerald-500/20" : "border-emerald-200", iconBg: isDark ? "bg-emerald-500/15" : "bg-emerald-50", iconColor: isDark ? "text-emerald-400" : "text-emerald-600" },
    { icon: Clock,        label: "In Progress", value: String(inProgress.length),     gradient: "from-amber-600/20 to-amber-500/5",  border: isDark ? "border-amber-500/20"   : "border-amber-200",   iconBg: isDark ? "bg-amber-500/15"   : "bg-amber-50",   iconColor: isDark ? "text-amber-400"   : "text-amber-600"   },
  ];

  const handleProgress = (courseId: string, progress: number, label: string) => {
    updateProgress(
      { courseId, progress },
      {
        onSuccess: () => toast.success(`Progress updated to ${label}`),
        onError: () => toast.error("Failed to update progress"),
      }
    );
  };

  return (
    <SidebarLayout>
      {/* Page banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${isDark ? "bg-[hsl(163,36%,8%)]/90" : "bg-slate-900/65"}`} />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-emerald-500/6 blur-[70px]" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-primary/6 blur-[50px]" />
        <div className="relative z-10 px-4 lg:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-serif font-bold text-white">My Learning</h1>
              <p className="text-xs text-white/60">Track your progress and continue learning</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial="hidden" animate="visible" variants={scaleIn} custom={i}>
              <div className={`rounded-xl border p-4 flex items-center gap-3 ${isDark ? `bg-gradient-to-br ${s.gradient} ${s.border}` : `bg-card shadow-sm ${s.border}`}`}>
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className={s.iconColor} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? "text-white" : "text-foreground"}`}>{isLoading ? "-" : s.value}</p>
                  <p className={`text-[11px] ${isDark ? "text-white/50" : "text-muted-foreground"}`}>{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Tabs defaultValue="in-progress" className="w-full">
            <TabsList className={`w-full justify-start bg-transparent border-b rounded-none p-0 h-auto gap-0 ${isDark ? "border-white/8" : "border-border"}`}>
              <TabsTrigger value="in-progress"
                className={`rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-3 sm:px-4 py-2.5 text-xs sm:text-sm ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
                In Progress ({inProgress.length})
              </TabsTrigger>
              <TabsTrigger value="completed"
                className={`rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-500 px-3 sm:px-4 py-2.5 text-xs sm:text-sm ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
                Completed ({completed.length})
              </TabsTrigger>
            </TabsList>

            {/* ── In Progress Tab ── */}
            <TabsContent value="in-progress" className="mt-6 space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${isDark ? "glass border-white/8" : "bg-card border-border shadow-sm"}`}>
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))
              ) : inProgress.length === 0 ? (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
                  className="text-center py-16">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-4 ${isDark ? "glass border-white/10" : "bg-muted border-border"}`}>
                    <BookOpen size={28} className={isDark ? "text-white/20" : "text-muted-foreground/40"} />
                  </div>
                  <p className={`mb-4 text-sm ${isDark ? "text-white/40" : "text-muted-foreground"}`}>You haven't enrolled in any courses yet.</p>
                  <Button onClick={() => navigate("/courses")} className="bg-gradient-gold hover:opacity-90 btn-shimmer">
                    Browse Courses
                  </Button>
                </motion.div>
              ) : (
                inProgress.map((enrollment: any, i: number) => {
                  const course = enrollment.courses;
                  if (!course) return null;
                  return (
                    <motion.div key={enrollment.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                      <div className={`rounded-xl border transition-all duration-300 card-lift ${isDark ? "glass border-white/8 hover:border-primary/25" : "bg-card border-border shadow-sm hover:border-primary/40 hover:shadow-md"}`}>
                        <div className="p-4 flex flex-col gap-4">

                          {/* Top row: thumbnail + info */}
                          <div className="flex gap-3">
                            <div className="w-20 h-20 sm:w-28 sm:h-24 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                              {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                <BookOpen size={24} className="text-primary/40" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                              <h3 className={`font-semibold text-sm leading-snug ${isDark ? "text-white" : "text-foreground"}`}>{course.title}</h3>
                              <p className={`text-xs ${isDark ? "text-white/35" : "text-muted-foreground"}`}>{course.total_duration}</p>
                              <div className="space-y-1">
                                <div className={`flex justify-between text-[11px] ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                                  <span>Progress</span><span>{enrollment.progress}%</span>
                                </div>
                                <div className={`relative h-2 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-muted"}`}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${enrollment.progress}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom row: progress buttons + continue button */}
                          <div className={`flex flex-wrap items-center justify-between gap-2 pt-1 border-t ${isDark ? "border-white/5" : "border-border"}`}>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[11px] mr-0.5 ${isDark ? "text-white/30" : "text-muted-foreground/60"}`}>Update:</span>
                              <button
                                onClick={() => handleProgress(course.id, 50, "50% (Halfway)")}
                                disabled={isUpdating || enrollment.progress === 50}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors
                                  ${enrollment.progress === 50
                                    ? "bg-primary/15 border-primary/30 text-primary cursor-default"
                                    : isDark
                                      ? "border-white/10 text-white/40 hover:border-primary hover:text-primary"
                                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                              >50% Halfway</button>
                              <button
                                onClick={() => handleProgress(course.id, 100, "100% (Complete!)")}
                                disabled={isUpdating}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${isDark ? "border-white/10 text-white/40 hover:border-emerald-500 hover:text-emerald-400" : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-600"}`}
                              >100% Done</button>
                            </div>
                            <Button size="sm" className="gap-1.5 text-xs bg-gradient-gold hover:opacity-90 shrink-0" asChild>
                              <Link to={`/course/${course.id}`}><Play size={12} /> Continue</Link>
                            </Button>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>

            {/* ── Completed Tab ── */}
            <TabsContent value="completed" className="mt-6 space-y-4">
              {completed.length === 0 ? (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
                  className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/25 flex items-center justify-center mx-auto mb-4">
                    <Trophy size={28} className="text-amber-400" />
                  </div>
                  <p className={`text-sm ${isDark ? "text-white/40" : "text-muted-foreground"}`}>Complete your first course to earn a certificate!</p>
                </motion.div>
              ) : (
                completed.map((enrollment: any, i: number) => {
                  const course = enrollment.courses;
                  if (!course) return null;
                  const cert = certByCourseId.get(course.id);
                  return (
                    <motion.div key={enrollment.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                      <div className={`rounded-xl border transition-all duration-300 card-lift ${isDark ? "glass border-emerald-500/15 hover:border-emerald-500/30" : "bg-card border-emerald-200 shadow-sm hover:border-emerald-400 hover:shadow-md"}`}>
                        <div className="p-4 flex flex-col gap-4">

                          <div className="flex gap-3">
                            <div className="w-20 h-20 sm:w-28 sm:h-24 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                              {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                <CheckCircle2 size={24} className="text-emerald-400/60" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <h3 className={`font-semibold text-sm leading-snug ${isDark ? "text-white" : "text-foreground"}`}>{course.title}</h3>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                <p className={`text-[11px] ${isDark ? "text-emerald-400/80" : "text-emerald-600"}`}>
                                  Completed {new Date(enrollment.completed_at).toLocaleDateString()}
                                </p>
                              </div>
                              {cert ? (
                                <p className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
                                  <Award size={11} /> Certificate issued {new Date(cert.issued_at).toLocaleDateString()}
                                </p>
                              ) : (
                                <p className={`text-[11px] italic ${isDark ? "text-white/30" : "text-muted-foreground/60"}`}>Certificate pending admin approval</p>
                              )}
                            </div>
                          </div>

                          <div className={`flex flex-wrap items-center gap-2 pt-1 border-t ${isDark ? "border-white/5" : "border-border"}`}>
                            {cert && (
                              <Button size="sm" variant="outline"
                                className="gap-1.5 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 flex-1 sm:flex-none">
                                <Award size={12} /> View Certificate
                              </Button>
                            )}
                            <button
                              onClick={() => handleProgress(course.id, 50, "50% (Halfway)")}
                              disabled={isUpdating}
                              className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-[11px] font-medium border transition-colors text-center ${isDark ? "border-white/10 text-white/35 hover:border-primary hover:text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                            >Mark as In Progress</button>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default MyLearning;
