import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PaymentModal from "@/components/PaymentModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Star, Users, BookOpen, Play, CheckCircle2, Award,
  Bookmark, ExternalLink, Video, Download, Presentation, FileText,
  FileType, FileSpreadsheet, File, Lock, ChevronRight, Home,
  Monitor, Laptop, UserCheck, ChevronDown, ChevronUp, BarChart3,
  Shield, Share2, Linkedin, Twitter, Mail, Heart, CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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

type TabId = "overview" | "curriculum" | "resources";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useCourseDetail(id);
  const toggleBookmark = useToggleBookmark();
  const enroll = useEnroll();
  const { data: bookmarksData } = useBookmarks();
  const { data: enrollmentsData } = useEnrollments();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const isBookmarked = (bookmarksData || []).some((b: any) => b.course_id === id);
  const isEnrolled = (enrollmentsData || []).some((e: any) => e.course_id === id);

  const { data: resources } = useQuery({
    queryKey: ["course-resources", id],
    queryFn: () => api.get<any[]>(`/api/resources/course/${id}`),
    enabled: !!id,
  });

  const handleEnroll = useCallback(async () => {
    if (!user) { navigate("/auth?tab=signup"); return; }
    if (!data) return;
    const courseData = data.course;
    if (Number(courseData.price) > 0) {
      setPaymentModalOpen(true);
      return;
    }
    try {
      await enroll.mutateAsync(id!);
      toast({ title: "Enrolled!", description: "You've been enrolled in this course." });
    } catch {
      toast({ title: "Error", description: "Could not enroll. You may already be enrolled.", variant: "destructive" });
    }
  }, [user, data, id, enroll, navigate, toast]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-3">
                <Skeleton className="h-11 w-32" />
                <Skeleton className="h-11 w-40" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-52 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (isError) {
    const is404 = (error as any)?.status === 404;
    return (
      <SidebarLayout>
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">
            {is404 ? "Course not found" : "Something went wrong"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {is404
              ? "This course doesn't exist or has been removed."
              : "We couldn't load this course. Please try again."}
          </p>
          <div className="flex items-center justify-center gap-3">
            {!is404 && (
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            )}
            <Button variant="outline" onClick={() => navigate("/courses")}>Browse Courses</Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!data) {
    return (
      <SidebarLayout>
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Course not found</h1>
          <p className="text-muted-foreground mb-4">This course doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
        </div>
      </SidebarLayout>
    );
  }

  const { course, modules } = data;
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const courseType = (course as any).course_type || "video";

  /* ── Locked state ── */
  if ((course as any).is_locked && !isEnrolled) {
    const isPaid = Number(course.price) > 0;
    return (
      <SidebarLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`bg-card border rounded-2xl shadow-2xl max-w-md w-full p-10 text-center ${
              isPaid ? "border-primary/30" : "border-amber-500/30"
            }`}
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isPaid ? "bg-primary/10 border-2 border-primary/30" : "bg-amber-500/10 border-2 border-amber-500/30"
                }`}>
                  <Lock size={36} className={isPaid ? "text-primary" : "text-amber-500"} />
                </div>
                <motion.div
                  className={`absolute inset-0 rounded-full border-2 ${isPaid ? "border-primary/20" : "border-amber-500/20"}`}
                  animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>

            <Badge variant="outline" className={`text-[10px] mb-3 ${isPaid ? "border-primary/40 text-primary" : "border-amber-500/40 text-amber-500"}`}>
              {course.category}
            </Badge>

            <h1 className="text-xl font-serif font-bold text-foreground mb-2">
              {isPaid ? "Unlock This Course" : "Access Required"}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mb-1">"{course.title}"</p>

            {isPaid ? (
              <>
                <div className="my-6 py-4 px-6 rounded-xl bg-primary/5 border border-primary/15">
                  <p className="text-3xl font-bold text-foreground">£{Number(course.price).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">One-time payment · Lifetime access</p>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2 text-left mb-7">
                  {["Full course access", "Downloadable resources", "Certificate of completion", "Expert mentorship", "30-day money-back guarantee"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer gap-2"
                    size="lg"
                    onClick={() => {
                      if (!user) { navigate("/auth?tab=signup"); return; }
                      setPaymentModalOpen(true);
                    }}
                  >
                    <CreditCard size={15} /> Pay & Enroll Now
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/courses")}>
                    <BookOpen size={14} /> Browse Free Courses
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-8">
                  This course requires admin approval to access. Contact our team to request access.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>← Go Back</Button>
                  <Button className="bg-gradient-gold hover:opacity-90 gap-2" onClick={() => navigate("/contact")}>
                    Request Access
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {isPaid && (
          <PaymentModal
            open={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            onSuccess={() => navigate(`/course/${id}`)}
            course={{ id: id!, title: course.title, price: Number(course.price), thumbnail_url: course.thumbnail_url, category: course.category }}
          />
        )}
      </SidebarLayout>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    ...(resources && resources.length > 0 ? [{ id: "resources" as TabId, label: `Resources (${resources.length})` }] : []),
  ];

  /* ── What's included list — from DB, fallback to defaults ── */
  const defaultIncluded = [
    "Live interactive sessions",
    "Industry case studies & datasets",
    "BA tools, templates & frameworks",
    "Simulation exercises",
    "Expert feedback & guidance",
    "Community access",
    "Certificate of completion",
  ];
  const included: string[] =
    Array.isArray((course as any).whats_included) && (course as any).whats_included.length > 0
      ? (course as any).whats_included
      : defaultIncluded;

  /* ── Key features in overview grid ── */
  const keyFeatures = [
    { icon: BarChart3, title: "Case Studies", desc: "Industry-based real-world cases" },
    { icon: Monitor, title: "Simulations", desc: "Interactive BA simulations" },
    { icon: FileText, title: "Tools & Templates", desc: "Practical BA tools and deliverables" },
    { icon: UserCheck, title: "Expert Guidance", desc: "Feedback from industry experts" },
  ];

  return (
    <SidebarLayout>
      <div className="max-w-5xl mx-auto">

        {/* ── TOP HERO ─────────────────────────────────────────────── */}
        <div className="px-4 lg:px-8 pt-6 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
            <Home size={12} />
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link to="/courses" className="hover:text-foreground transition-colors">Courses</Link>
            <ChevronRight size={11} />
            <span className="text-foreground truncate max-w-[200px]">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left: course info */}
            <motion.div
              initial="hidden" animate="visible"
              className="lg:col-span-3 space-y-4"
            >
              <motion.div variants={fadeUp} custom={0} className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] font-semibold px-2.5 py-0.5">
                  {course.category}
                </Badge>
                {course.skill_level && (
                  <Badge variant="outline" className="text-[10px] px-2.5 py-0.5">{course.skill_level}</Badge>
                )}
              </motion.div>

              <motion.h1
                variants={fadeUp} custom={1}
                className="text-2xl lg:text-3xl font-serif font-bold text-foreground leading-tight"
              >
                {course.title}
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-sm text-muted-foreground leading-relaxed">
                {course.description}
              </motion.p>

              {/* Feature pills */}
              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                {[
                  { icon: Laptop, label: "Hands-on Learning" },
                  { icon: BarChart3, label: "Real-world Scenarios" },
                  { icon: UserCheck, label: "Expert Mentorship" },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon size={13} className="text-primary" />
                      <span>{f.label}</span>
                    </div>
                  );
                })}
              </motion.div>

              {/* Rating + stats */}
              {course.rating > 0 && (
                <motion.div variants={fadeUp} custom={4} className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-foreground">{course.rating}</span>
                  </span>
                  {course.total_duration && (
                    <span className="flex items-center gap-1"><Clock size={13} /> {course.total_duration}</span>
                  )}
                  <span className="flex items-center gap-1"><BookOpen size={13} /> {totalLessons} lessons</span>
                </motion.div>
              )}

              {/* CTA buttons */}
              <motion.div variants={fadeUp} custom={5} className="flex items-center gap-3 flex-wrap pt-1">
                {isEnrolled ? (
                  <>
                    <Button size="lg" variant="outline" disabled className="gap-2 text-sm px-6">
                      <CheckCircle2 size={15} /> Already Enrolled
                    </Button>
                    {course.live_class_url && (
                      <Button size="lg" asChild className="bg-gradient-gold hover:opacity-90 gap-2 text-sm px-6 btn-shimmer">
                        <a href={course.live_class_url} target="_blank" rel="noopener noreferrer">
                          {courseType === "live" ? <><Video size={15} /> Join Live Class</> :
                           courseType === "book" ? <><BookOpen size={15} /> Open Book</> :
                           <><Play size={15} /> Open Video</>}
                          <ExternalLink size={13} />
                        </a>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enroll.isPending}
                      className="bg-gradient-gold hover:opacity-90 font-semibold text-sm px-7 btn-shimmer"
                    >
                      {enroll.isPending ? "Enrolling..." : "Enroll Now"}
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2 text-sm px-6 border-border">
                      <Download size={15} /> Download Brochure
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Right: video thumbnail */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-video shadow-lg border border-border group cursor-pointer">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <div className="text-muted-foreground/30">
                      <Video size={48} />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-3 group-hover:bg-black/40 transition-colors">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl"
                  >
                    <Play size={22} className="text-slate-800 ml-0.5" fill="currentColor" />
                  </motion.div>
                  <span className="text-white text-xs font-medium">Watch Course Overview</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── TABS ──────────────────────────────────────────────────── */}
        <div className="px-4 lg:px-8 mt-8 border-b border-border">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {activeTab === t.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────────────── */}
        <div className="px-4 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    <div>
                      <h2 className="text-lg font-serif font-bold text-foreground mb-3">About This Course</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                    </div>

                    {/* 4 feature grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {keyFeatures.map((f) => {
                        const Icon = f.icon;
                        return (
                          <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon size={17} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-foreground">{f.title}</p>
                              <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* What you will learn — derived from lesson titles */}
                    {modules.length > 0 && (
                      <div>
                        <h2 className="text-lg font-serif font-bold text-foreground mb-4">What You Will Learn</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {modules.flatMap((m) => m.lessons || []).slice(0, 8).map((lesson: any) => (
                            <div key={lesson.id} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                              <span className="text-sm text-muted-foreground leading-snug">{lesson.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {course.tags.map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Capstone */}
                    {modules.length > 0 && (
                      <div className="flex items-start gap-4 p-5 rounded-xl bg-primary/5 border border-primary/15">
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <Award size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">Capstone Project</p>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                            Work on an end-to-end BA simulation project and present your solution to a panel of experts.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Share */}
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">Share This Course</p>
                      <p className="text-xs text-muted-foreground mb-3">Know someone who would benefit from this?</p>
                      <div className="flex items-center gap-2">
                        {[
                          { icon: Linkedin, label: "LinkedIn", color: "hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/20" },
                          { icon: Twitter, label: "Twitter", color: "hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/20" },
                          { icon: Mail, label: "Email", color: "hover:bg-primary/10 hover:text-primary hover:border-primary/20" },
                        ].map((s) => {
                          const Icon = s.icon;
                          return (
                            <button
                              key={s.label}
                              aria-label={`Share on ${s.label}`}
                              className={`w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground transition-all ${s.color}`}
                            >
                              <Icon size={15} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <CourseSidebar
                    course={course}
                    isEnrolled={isEnrolled}
                    isBookmarked={isBookmarked}
                    handleEnroll={handleEnroll}
                    enrollPending={enroll.isPending}
                    toggleBookmark={() => toggleBookmark.mutate(id!)}
                    user={user}
                    included={included}
                    courseType={courseType}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "curriculum" && (
              <motion.div
                key="curriculum"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-serif font-bold text-foreground">Curriculum Overview</h2>
                      <span className="text-xs text-muted-foreground">{modules.length} modules · {totalLessons} lessons</span>
                    </div>

                    {modules.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-8 text-center">Curriculum coming soon.</p>
                    ) : (
                      modules.map((section) => {
                        const isOpen = openModules.has(section.id);
                        return (
                          <div key={section.id} className="border border-border rounded-xl overflow-hidden">
                            <button
                              onClick={() => toggleModule(section.id)}
                              className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/30 transition-colors text-left"
                            >
                              <div>
                                <p className="font-semibold text-sm text-foreground">{section.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{section.lessons?.length || 0} Lessons</p>
                              </div>
                              {isOpen ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: "auto" }}
                                  exit={{ height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  {(section.lessons || []).map((lesson: any) => (
                                    <div key={lesson.id} className="flex items-center justify-between px-5 py-3 border-t border-border hover:bg-muted/20 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <Play size={12} className="text-muted-foreground shrink-0" fill="currentColor" />
                                        <span className="text-sm text-foreground">{lesson.title}</span>
                                        {lesson.is_free && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-500/30 text-emerald-400">Free</Badge>}
                                      </div>
                                      {lesson.duration && <span className="text-xs text-muted-foreground shrink-0 ml-3">{lesson.duration}</span>}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Sidebar */}
                  <CourseSidebar
                    course={course}
                    isEnrolled={isEnrolled}
                    isBookmarked={isBookmarked}
                    handleEnroll={handleEnroll}
                    enrollPending={enroll.isPending}
                    toggleBookmark={() => toggleBookmark.mutate(id!)}
                    user={user}
                    included={included}
                    courseType={courseType}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "resources" && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="max-w-2xl space-y-3">
                  <p className="text-sm text-muted-foreground mb-5">Download course materials, slides, and supporting documents.</p>
                  {(resources || []).map((resource: any) => {
                    const IconComp = getFileIconComp(resource.file_type);
                    return (
                      <a key={resource.id} href={resource.file_url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <IconComp size={20} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{resource.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary uppercase px-1.5 py-0">{resource.file_type}</Badge>
                              {resource.file_size && <span className="text-[11px] text-muted-foreground">{resource.file_size}</span>}
                            </div>
                          </div>
                          <Download size={15} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── BOTTOM CTA BANNER ────────────────────────────────────── */}
        <div className="mx-4 lg:mx-8 mb-8 rounded-2xl overflow-hidden relative" style={{ background: "hsl(var(--hero-gradient-from))" }}>
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Award size={26} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Ready to apply your BA skills in the real world?</h3>
                <p className="text-sm text-white/60 mt-0.5">Join the next batch and take the next step in your BA journey.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isEnrolled ? (
                course.live_class_url ? (
                  <Button asChild className="bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer px-6">
                    <a href={course.live_class_url} target="_blank" rel="noopener noreferrer">
                      {courseType === "live" ? "Join Live Class" : "Access Course"}
                    </a>
                  </Button>
                ) : null
              ) : (
                <Button
                  onClick={handleEnroll}
                  disabled={enroll.isPending}
                  className="bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer px-6"
                >
                  Enroll Now
                </Button>
              )}
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-6" asChild>
                <Link to="/contact">Talk to an Advisor</Link>
              </Button>
            </div>
          </div>
        </div>

      </div>

      {Number(course.price) > 0 && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {}}
          course={{ id: id!, title: course.title, price: Number(course.price), thumbnail_url: course.thumbnail_url, category: course.category }}
        />
      )}
    </SidebarLayout>
  );
};

/* ── Reusable sidebar component ─────────────────────────────────── */
interface SidebarProps {
  course: any;
  isEnrolled: boolean;
  isBookmarked: boolean;
  handleEnroll: () => void;
  enrollPending: boolean;
  toggleBookmark: () => void;
  user: any;
  included: string[];
  courseType: string;
}

const CourseSidebar = ({
  course, isEnrolled, isBookmarked, handleEnroll,
  enrollPending, toggleBookmark, user, included, courseType,
}: SidebarProps) => {
  const courseDetails = [
    { label: "Level",       value: course.skill_level || "All levels" },
    { label: "Duration",    value: course.total_duration || "—" },
    { label: "Mode",        value: courseType === "live" ? "Live Online" : courseType === "book" ? "Self-paced" : "On-demand Video" },
    { label: "Next Batch",  value: (course as any).next_batch_date || "Coming soon" },
    { label: "Schedule",    value: (course as any).schedule || (courseType === "live" ? "To be confirmed" : "Flexible") },
    { label: "Certificate", value: (course as any).certificate_name || "Certificate of Completion" },
  ];

  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      {/* Course details card */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-5 space-y-3">
          {courseDetails.map((d) => (
            <div key={d.label} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground shrink-0">{d.label}</span>
              <span className="text-xs font-medium text-foreground text-right leading-snug">{d.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing + enroll card */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">
              {course.price > 0 ? `£${Number(course.price).toLocaleString()}` : "Free"}
            </span>
            {course.price > 0 && <span className="text-xs text-muted-foreground">GBP</span>}
          </div>

          {isEnrolled ? (
            <>
              <Button className="w-full" size="lg" variant="outline" disabled>
                <CheckCircle2 size={15} className="mr-2" /> Already Enrolled
              </Button>
              {course.live_class_url && (
                <Button className="w-full bg-gradient-gold hover:opacity-90 gap-2" size="lg" asChild>
                  <a href={course.live_class_url} target="_blank" rel="noopener noreferrer">
                    {courseType === "live" ? <><Video size={14} /> Join Live Class</> :
                     courseType === "book" ? <><BookOpen size={14} /> Open Book</> :
                     <><Play size={14} /> Open Video</>}
                    <ExternalLink size={12} />
                  </a>
                </Button>
              )}
            </>
          ) : (
            <Button
              className="w-full bg-gradient-gold hover:opacity-90 font-semibold btn-shimmer"
              size="lg"
              onClick={handleEnroll}
              disabled={enrollPending}
            >
              {enrollPending ? "Enrolling..." : "Enroll Now"}
            </Button>
          )}

          {user && (
            <Button
              variant="outline"
              className="w-full gap-2 border-border"
              onClick={toggleBookmark}
              size="lg"
            >
              <Heart size={14} className={isBookmarked ? "fill-red-500 text-red-500" : ""} />
              {isBookmarked ? "Saved to Wishlist" : "Add to Wishlist"}
            </Button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Shield size={11} />
            <span>30-Day Money Back Guarantee</span>
          </div>
        </CardContent>
      </Card>

      {/* What's included */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-5">
          <p className="font-semibold text-sm text-foreground mb-3">What's Included</p>
          <ul className="space-y-2">
            {included.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-primary shrink-0" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetail;
