import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, Filter, Star, Clock, Bookmark, ChevronRight, ChevronLeft,
  Briefcase, BarChart3, Award, Users, Wrench, FileText, Globe, CalendarDays, FolderOpen,
  Play, Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useCourses } from "@/hooks/use-courses";
import { useMentors } from "@/hooks/use-mentors";
import { useBookmarks, useToggleBookmark } from "@/hooks/use-bookmarks";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { label: "Project Management", icon: Briefcase },
  { label: "Business Analysis", icon: BarChart3 },
  { label: "Certifications", icon: Award },
  { label: "Mentorship", icon: Users },
  { label: "Career Tools", icon: Wrench },
  { label: "Templates", icon: FileText },
  { label: "Networking", icon: Globe },
  { label: "Workshops", icon: CalendarDays },
  { label: "Resources", icon: FolderOpen },
];



function useHScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };
  return { ref, scroll };
}

const Explore = () => {
  const [search, setSearch] = useState("");
  const trending = useHScroll();
  const { user } = useAuth();

  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: mentors, isLoading: mentorsLoading } = useMentors();
  const { data: bookmarksData } = useBookmarks();
  const { data: enrollmentsData } = useEnrollments();
  const toggleBookmark = useToggleBookmark();

  const bookmarkedIds = (bookmarksData || []).map((b: any) => b.course_id);
  const enrolledCourses = (enrollmentsData || []).map((e: any) => ({
    ...e.courses,
    progress: e.progress,
  }));

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto space-y-10">

        {/* Filters */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={0} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Select>
              <SelectTrigger className="w-[140px] h-9 bg-card border-border text-sm"><Filter size={14} className="mr-1 text-muted-foreground" /><SelectValue placeholder="Skill Level" /></SelectTrigger>
              <SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[120px] h-9 bg-card border-border text-sm"><SelectValue placeholder="Duration" /></SelectTrigger>
              <SelectContent><SelectItem value="short">&lt; 10h</SelectItem><SelectItem value="medium">10-30h</SelectItem><SelectItem value="long">30h+</SelectItem></SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[140px] h-9 bg-card border-border text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c.label} value={c.label}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* Trending Courses */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-foreground">🔥 Trending Courses</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => trending.scroll("left")}><ChevronLeft size={16} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => trending.scroll("right")}><ChevronRight size={16} /></Button>
            </div>
          </div>
          <div ref={trending.ref} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            {coursesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[280px] max-w-[280px] snap-start flex-shrink-0">
                  <Card className="border-border bg-card h-full"><CardContent className="p-0"><Skeleton className="h-36 rounded-t-lg" /><div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></CardContent></Card>
                </div>
              ))
            ) : (
              (courses || []).map((c) => (
                <Link key={c.id} to={`/course/${c.id}`} className="min-w-[280px] max-w-[280px] snap-start flex-shrink-0">
                  <Card className="border-border bg-card hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 h-full">
                    <CardContent className="p-0">
                      <div className="h-36 bg-muted flex items-center justify-center text-5xl rounded-t-lg relative">
                        {c.thumbnail_url ? (
                          <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl">📘</span>
                        )}
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5">{c.category}</Badge>
                        <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] px-2 py-0.5">
                          {(c as any).course_type === "live" ? "🔴 Live Class" : (c as any).course_type === "book" ? "📚 Book" : "📹 Video"}
                        </Badge>
                        {user && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark.mutate(c.id); }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                          >
                            <Bookmark size={14} className={bookmarkedIds.includes(c.id) ? "fill-primary text-primary" : "text-muted-foreground"} />
                          </button>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-sm text-foreground leading-snug">{c.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock size={12} />{c.total_duration}</span>
                          <span className="flex items-center gap-1"><Star size={12} className="text-primary fill-primary" />{c.rating}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || []).slice(0, 2).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                        <p className="text-base font-bold text-foreground">{c.price > 0 ? `£${c.price}` : "Free"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </motion.section>

        {/* Categories */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-foreground">Browse Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {categories.map((cat) => (
              <button key={cat.label} className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5">
                <cat.icon size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground font-medium text-center leading-tight transition-colors">{cat.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Recommended / Enrolled */}
        {enrolledCourses.length > 0 && (
          <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3} className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-lg font-serif font-bold text-foreground">Continue Learning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enrolledCourses.slice(0, 3).map((c: any) => (
                <Link key={c.id} to={`/course/${c.id}`}>
                  <Card className="border-border bg-card hover:border-primary/30 transition-all duration-200 h-full">
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-semibold text-sm text-foreground">{c.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star size={12} className="text-primary fill-primary" />{c.rating}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Progress</span><span>{c.progress}%</span>
                        </div>
                        <Progress value={c.progress} className="h-1.5" />
                      </div>
                      <Button size="sm" variant="outline" className="w-full gap-1 text-xs">
                        <Play size={12} /> {c.progress > 0 ? "Continue Learning" : "Start Course"}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Mentors */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={4} className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-foreground">Mentors to Connect With</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mentorsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-border bg-card"><CardContent className="p-5 flex flex-col items-center space-y-3"><Skeleton className="w-14 h-14 rounded-full" /><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></CardContent></Card>
              ))
            ) : (
              (mentors || []).map((m) => (
                <Link key={m.id} to={`/mentor/${m.id}`}>
                  <Card className="border-border bg-card hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 h-full">
                    <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center text-lg font-bold">{getInitials(m.name)}</div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{m.name}</h3>
                        <p className="text-xs text-muted-foreground">{m.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{m.years_experience} yrs experience</p>
                      </div>
                      <Button size="sm" className="w-full text-xs gap-1">
                        <CalendarDays size={12} /> View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </motion.section>

        <div className="pb-8" />
      </div>
    </SidebarLayout>
  );
};

export default Explore;
