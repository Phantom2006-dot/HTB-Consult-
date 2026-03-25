import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Play, Award, CheckCircle2, Trophy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useEnrollments, useUpdateProgress } from "@/hooks/use-enrollments";
import { toast } from "sonner";

const MyLearning = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: enrollments, isLoading } = useEnrollments();
  const { mutate: updateProgress, isPending: isUpdating } = useUpdateProgress();

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

  const stats = [
    { icon: BookOpen, label: "Enrolled", value: String(allEnrollments.length) },
    { icon: CheckCircle2, label: "Completed", value: String(completed.length) },
    { icon: Clock, label: "In Progress", value: String(inProgress.length) },
    { icon: Trophy, label: "Certificates", value: String(completed.length) },
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
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1">My Learning</h1>
          <p className="text-sm text-muted-foreground">Track your progress and continue learning</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{isLoading ? "-" : s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Tabs defaultValue="in-progress" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto gap-0">
              <TabsTrigger value="in-progress" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
                In Progress ({inProgress.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
                Completed ({completed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="in-progress" className="mt-6 space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="border-border bg-card"><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                ))
              ) : inProgress.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                  <Button onClick={() => navigate("/explore")}>Browse Courses</Button>
                </div>
              ) : (
                inProgress.map((enrollment: any) => {
                  const course = enrollment.courses;
                  if (!course) return null;
                  return (
                    <Card key={enrollment.id} className="border-border bg-card hover:border-primary/30 transition-all duration-200">
                      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-36 h-24 bg-secondary/50 rounded-lg flex items-center justify-center shrink-0">
                          <BookOpen size={28} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <h3 className="font-semibold text-sm text-foreground">{course.title}</h3>
                          <p className="text-xs text-muted-foreground">{course.total_duration}</p>
                          <div className="space-y-1 max-w-sm">
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                              <span>Progress</span><span>{enrollment.progress}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="h-1.5" />
                          </div>
                          {/* Manual progress update */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-muted-foreground">Update progress:</span>
                            <button
                              onClick={() => handleProgress(course.id, 50, "50% (Halfway)")}
                              disabled={isUpdating || enrollment.progress === 50}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors
                                ${enrollment.progress === 50
                                  ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                            >
                              50% Halfway
                            </button>
                            <button
                              onClick={() => handleProgress(course.id, 100, "100% (Complete!)")}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded text-[11px] font-medium border border-border text-muted-foreground hover:border-green-500 hover:text-green-600 transition-colors"
                            >
                              100% Done
                            </button>
                          </div>
                        </div>
                        <div className="shrink-0 flex sm:flex-col items-center gap-2">
                          <Button size="sm" className="gap-1.5 text-xs" asChild>
                            <Link to={`/course/${course.id}`}><Play size={12} /> Continue</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6 space-y-4">
              {completed.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Complete your first course to earn a certificate!</p>
                </div>
              ) : (
                completed.map((enrollment: any) => {
                  const course = enrollment.courses;
                  if (!course) return null;
                  return (
                    <Card key={enrollment.id} className="border-border bg-card">
                      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-36 h-24 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                          <CheckCircle2 size={28} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-semibold text-sm text-foreground">{course.title}</h3>
                          <p className="text-[11px] text-muted-foreground">Completed {new Date(enrollment.completed_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                            <Award size={12} /> View Certificate
                          </Button>
                          <button
                            onClick={() => handleProgress(course.id, 50, "50% (Halfway)")}
                            disabled={isUpdating}
                            className="px-2.5 py-1 rounded text-[11px] font-medium border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            Mark as In Progress
                          </button>
                        </div>
                      </CardContent>
                    </Card>
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
