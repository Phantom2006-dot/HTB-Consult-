import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, Star, Users, BookOpen, Play, CheckCircle2, Award,
  Bookmark, ExternalLink, Video, Download, Presentation, FileText,
  FileType, FileSpreadsheet, File, Lock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useCourseDetail } from "@/hooks/use-courses";
import { useToggleBookmark, useBookmarks } from "@/hooks/use-bookmarks";
import { useEnroll, useEnrollments } from "@/hooks/use-enrollments";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const FILE_ICONS: Record<string, React.ElementType> = {
  pptx: Presentation, ppt: Presentation,
  pdf: FileType,
  docx: FileText, doc: FileText,
  xlsx: FileSpreadsheet, xls: FileSpreadsheet,
};
function getFileIconComp(t: string) { return FILE_ICONS[t?.toLowerCase()] || File; }

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useCourseDetail(id);
  const toggleBookmark = useToggleBookmark();
  const enroll = useEnroll();
  const { data: bookmarksData } = useBookmarks();
  const { data: enrollmentsData } = useEnrollments();

  const isBookmarked = (bookmarksData || []).some((b: any) => b.course_id === id);
  const isEnrolled = (enrollmentsData || []).some((e: any) => e.course_id === id);

  const { data: resources } = useQuery({
    queryKey: ["course-resources", id],
    queryFn: () => api.get<any[]>(`/api/resources/course/${id}`),
    enabled: !!id,
  });

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth?tab=signup");
      return;
    }
    try {
      await enroll.mutateAsync(id!);
      toast({ title: "Enrolled!", description: "You've been enrolled in this course." });
    } catch {
      toast({ title: "Error", description: "Could not enroll. You may already be enrolled.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-80" />
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!data) {
    return (
      <SidebarLayout>
        <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto text-center py-20">
          <h1 className="text-xl font-bold text-foreground mb-2">Course not found</h1>
          <p className="text-muted-foreground mb-4">This course doesn't exist or isn't published yet.</p>
          <Button onClick={() => navigate("/explore")}>Browse Courses</Button>
        </div>
      </SidebarLayout>
    );
  }

  const { course, modules } = data;
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  // ── Locked course gate ────────────────────────────────────────────────────
  if ((course as any).is_locked) {
    return (
      <SidebarLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="bg-card border border-amber-500/30 rounded-2xl shadow-2xl max-w-md w-full p-10 text-center"
          >
            {/* Pulsing lock */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                  <Lock size={36} className="text-amber-500" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-500/20"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500 mb-3">
              {course.category}
            </Badge>

            <h1 className="text-xl font-serif font-bold text-foreground mb-2">
              This Course is Currently Locked
            </h1>
            <p className="text-sm font-medium text-muted-foreground mb-1">"{course.title}"</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-8">
              Our team is preparing this course for you. It will be available again soon — please check back later or explore our other courses in the meantime.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="gap-2 border-border" onClick={() => navigate(-1)}>
                ← Go Back
              </Button>
              <Button className="bg-gradient-gold hover:opacity-90 gap-2" onClick={() => navigate("/courses")}>
                <BookOpen size={14} /> Browse Courses
              </Button>
            </div>
          </motion.div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-8">
        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary text-primary-foreground text-[10px]">{course.category}</Badge>
              <Badge variant="outline" className="text-[10px]">{course.skill_level}</Badge>
              <Badge variant="secondary" className="text-[10px]">
                {(course as any).course_type === "live" ? "🔴 Live Class" : (course as any).course_type === "book" ? "📚 Book" : "📹 Video Course"}
              </Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground leading-tight">{course.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Star size={14} className="text-primary fill-primary" /> {course.rating}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {course.total_duration}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(course.tags || []).map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>

          {/* Enroll Card */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="h-40 bg-secondary/50 rounded-lg flex items-center justify-center">
                <Play size={40} className="text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">{course.price > 0 ? `£${course.price}` : "Free"}</p>
              {isEnrolled ? (
                <>
                  <Button className="w-full" size="lg" variant="outline" disabled>Already Enrolled</Button>
                  {course.live_class_url ? (
                    <Button className="w-full gap-2" size="lg" asChild>
                      <a href={course.live_class_url} target="_blank" rel="noopener noreferrer">
                        {(course as any).course_type === "live" ? (
                          <><Video size={16} /> Join Live Class</>
                        ) : (course as any).course_type === "book" ? (
                          <><BookOpen size={16} /> Open Book / Resource</>
                        ) : (
                          <><Play size={16} /> Open Video</>
                        )}
                        <ExternalLink size={14} />
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full gap-2" size="lg" variant="secondary" disabled>
                      {(course as any).course_type === "live" ? (
                        <><Video size={16} /> Live Class — No link yet</>
                      ) : (course as any).course_type === "book" ? (
                        <><BookOpen size={16} /> Book — No link yet</>
                      ) : (
                        <><Play size={16} /> Video — No link yet</>
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enroll.isPending}>
                  {enroll.isPending ? "Enrolling..." : "Enroll Now"}
                </Button>
              )}
              {user && (
                <Button variant="outline" className="w-full gap-2" onClick={() => toggleBookmark.mutate(id!)}>
                  <Bookmark size={14} className={isBookmarked ? "fill-primary text-primary" : ""} />
                  {isBookmarked ? "Saved" : "Save for Later"}
                </Button>
              )}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Award size={12} /> Certificate</span>
                <span className="flex items-center gap-1"><BookOpen size={12} /> {totalLessons} lessons</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto gap-0">
              {[
                { value: "curriculum", label: "Curriculum" },
                { value: "overview", label: "Overview" },
                ...(resources && resources.length > 0 ? [{ value: "resources", label: `Resources (${resources.length})` }] : []),
              ].map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="curriculum" className="mt-6 space-y-4">
              {modules.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">Curriculum coming soon.</p>
              ) : (
                modules.map((section) => (
                  <Card key={section.id} className="border-border bg-card">
                    <CardContent className="p-0">
                      <div className="px-5 py-3 border-b border-border">
                        <h3 className="font-semibold text-sm text-foreground">{section.title}</h3>
                        <p className="text-xs text-muted-foreground">{section.lessons?.length || 0} lessons</p>
                      </div>
                      {(section.lessons || []).map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <Play size={14} className="text-muted-foreground" />
                            <span className="text-sm text-foreground">{lesson.title}</span>
                            {lesson.is_free && <Badge variant="outline" className="text-[9px] px-1.5 py-0">Free</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">About this course</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Category:</span> <span className="text-foreground">{course.category}</span></div>
                  <div><span className="text-muted-foreground">Level:</span> <span className="text-foreground">{course.skill_level}</span></div>
                  <div><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{course.total_duration}</span></div>
                  <div><span className="text-muted-foreground">Modules:</span> <span className="text-foreground">{modules.length}</span></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-6 space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Download course materials, slides, and supporting documents.
              </p>
              {(resources || []).map((resource: any) => {
                const IconComp = getFileIconComp(resource.file_type);
                return (
                  <a
                    key={resource.id}
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="border-border bg-card hover:border-primary/40 transition-colors group cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <IconComp size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {resource.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary uppercase px-1.5 py-0">
                              {resource.file_type}
                            </Badge>
                            {resource.file_size && (
                              <span className="text-[11px] text-muted-foreground">{resource.file_size}</span>
                            )}
                          </div>
                        </div>
                        <Download size={15} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default CourseDetail;
