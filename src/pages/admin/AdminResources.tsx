import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileText, Upload, ChevronRight, Presentation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const AdminResources = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get<any[]>("/api/admin/courses"),
  });

  const { data: allResources = [] } = useQuery<any[]>({
    queryKey: ["all-resources-summary"],
    queryFn: async () => {
      if (!courses || courses.length === 0) return [];
      const results = await Promise.all(
        courses.map((c: any) =>
          api.get<any[]>(`/api/resources/course/${c.id}`).then((res) =>
            res.map((r) => ({ ...r, course_id: c.id }))
          ).catch(() => [])
        )
      );
      return results.flat();
    },
    enabled: !!courses && courses.length > 0,
  });

  const resourceCountByCourse = (allResources as any[]).reduce((acc: Record<string, number>, r: any) => {
    acc[r.course_id] = (acc[r.course_id] || 0) + 1;
    return acc;
  }, {});

  const totalResources = (allResources as any[]).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Resources</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Upload documents, slides, and files for each course
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
              <FileText size={14} />
              <span>{totalResources} file{totalResources !== 1 ? "s" : ""} total</span>
            </div>
          </div>
        </motion.div>

        {/* How it works hint */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Upload size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">How to upload resources</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click <strong>Manage Files</strong> on any course below to upload PowerPoint, PDF, Word, Excel, MP4, or ZIP files.
                Students enrolled in that course will see a <strong>Resources</strong> tab on the course page.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Course list */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Courses ({(courses || []).length})
          </h2>

          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : !courses || courses.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-10 text-center">
                <BookOpen size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No courses yet. Create a course first.</p>
                <Button asChild className="mt-4" size="sm">
                  <Link to="/admin/courses">Go to Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            (courses || []).map((course: any, i: number) => {
              const count = resourceCountByCourse[course.id] || 0;
              return (
                <motion.div key={course.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Card className="border-border bg-card hover:border-primary/25 transition-colors group">
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Thumbnail */}
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt=""
                          className="w-14 h-12 rounded-lg object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="w-14 h-12 rounded-lg bg-muted/40 border border-border shrink-0 flex items-center justify-center">
                          <BookOpen size={18} className="text-muted-foreground/40" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-foreground truncate">{course.title}</h3>
                          {!course.published && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">Draft</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">{course.category}</span>
                          <span className="text-xs text-muted-foreground">{course.skill_level}</span>
                          <span className={`flex items-center gap-1 text-xs font-medium ${count > 0 ? "text-primary" : "text-muted-foreground/50"}`}>
                            <Presentation size={11} />
                            {count > 0 ? `${count} file${count !== 1 ? "s" : ""}` : "No files yet"}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        asChild
                        size="sm"
                        variant={count > 0 ? "outline" : "default"}
                        className={`gap-1.5 shrink-0 ${count === 0 ? "bg-gradient-gold hover:opacity-90 border-0" : ""}`}
                      >
                        <Link to={`/admin/courses/${course.id}/resources`}>
                          {count > 0 ? (
                            <>Manage Files <ChevronRight size={13} /></>
                          ) : (
                            <><Upload size={13} /> Upload Files</>
                          )}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminResources;
