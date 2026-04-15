import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight, BookOpen, SlidersHorizontal, ArrowDownAZ, ArrowUpAZ, Hash, Lock, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";
import { useCourses } from "@/hooks/use-courses";

type SortOption = "numeric" | "az" | "za";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermediate: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Advanced: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const SORT_LABELS: Record<SortOption, string> = {
  numeric: "Numeric (1, 2, 3…)",
  az: "A → Z",
  za: "Z → A",
};

function extractLeadingNumber(title: string): number {
  const match = title.match(/\d+/);
  return match ? parseInt(match[0], 10) : Infinity;
}

const Courses = () => {
  const { data: courses, isLoading } = useCourses();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("numeric");
  const [lockedCourse, setLockedCourse] = useState<{ title: string; category: string } | null>(null);

  const categories = useMemo(() => {
    if (!courses) return [];
    const counts: Record<string, number> = {};
    courses.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    const base = activeCategory === "All" ? courses : courses.filter((c) => c.category === activeCategory);
    return [...base].sort((a, b) => {
      if (sortBy === "numeric") return extractLeadingNumber(a.title) - extractLeadingNumber(b.title);
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return 0;
    });
  }, [courses, activeCategory, sortBy]);

  return (
    <Layout>
      {/* Header */}
      <section className="py-16 lg:py-24 bg-gradient-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(30, 100%, 46%) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">HTB Consult Academy</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Practical Training for Professional Growth
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl">
              Practical skills training in business analysis, project delivery, digital transformation, and professional development — built from real consulting experience.
            </motion.p>
            {!isLoading && courses && (
              <motion.p variants={fadeUp} custom={3} className="text-sm text-white/50 mt-4">
                {courses.length} courses available
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Category filters + Sort */}
      <section className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 py-3">
            <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide min-w-0">
              <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
              <button
                onClick={() => setActiveCategory("All")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === "All"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                All ({courses?.length ?? 0})
              </button>
              {categories.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>

            <div className="shrink-0 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors whitespace-nowrap border border-border">
                    {sortBy === "numeric" && <Hash size={12} />}
                    {sortBy === "az" && <ArrowDownAZ size={12} />}
                    {sortBy === "za" && <ArrowUpAZ size={12} />}
                    {SORT_LABELS[sortBy]}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <DropdownMenuRadioItem value="numeric" className="text-xs gap-2">
                      <Hash size={12} /> Numeric (1, 2, 3…)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="az" className="text-xs gap-2">
                      <ArrowDownAZ size={12} /> A → Z
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="za" className="text-xs gap-2">
                      <ArrowUpAZ size={12} /> Z → A
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-12 lg:py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <BookOpen size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No courses in this category yet.</p>
              <button onClick={() => setActiveCategory("All")} className="text-primary text-sm mt-2 hover:underline">
                View all courses
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-card border-border h-full flex flex-col">
                  <CardContent className="p-6 flex-1 space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filtered.map((course, i) => {
                const isLocked = !!course.is_locked;
                return (
                  <motion.div key={course.id} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 6} variants={fadeUp}>
                    <Card className={`bg-card border-border transition-all duration-300 h-full flex flex-col ${isLocked ? "opacity-80" : "hover:border-primary/40 hover:shadow-gold"}`}>
                      {/* Thumbnail */}
                      <div className="h-44 bg-muted rounded-t-lg overflow-hidden shrink-0 relative">
                        {(course as any).thumbnail_url ? (
                          <img src={(course as any).thumbnail_url} alt={course.title} className={`w-full h-full object-cover ${isLocked ? "grayscale" : ""}`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <BookOpen size={36} className="text-primary/40" />
                          </div>
                        )}
                        {/* Lock overlay on thumbnail */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                              <Lock size={22} className="text-amber-400" />
                            </div>
                            <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">Locked</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-5 flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px]">
                            {course.category}
                          </Badge>
                          {(course as any).skill_level && (
                            <Badge variant="outline" className={`text-[10px] border ${LEVEL_COLORS[(course as any).skill_level] || ""}`}>
                              {(course as any).skill_level}
                            </Badge>
                          )}
                          {(course as any).course_type === "live" && (
                            <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">🔴 Live</Badge>
                          )}
                          {isLocked && (
                            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500 gap-1">
                              <Lock size={9} /> Locked
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 leading-snug">{course.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">{course.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.total_duration}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(course.tags || []).slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="p-5 pt-0 flex items-center justify-between">
                        <span className="text-xl font-bold text-gradient-gold">
                          {(course as any).price > 0 ? `£${(course as any).price}` : "Free"}
                        </span>
                        {isLocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                            onClick={() => setLockedCourse({ title: course.title, category: course.category })}
                          >
                            <Lock size={12} /> Locked
                          </Button>
                        ) : (
                          <Button size="sm" asChild className="bg-gradient-gold hover:opacity-90 text-xs gap-1">
                            <Link to={`/course/${course.id}`}>
                              View Course <ArrowRight size={13} />
                            </Link>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Locked Course Modal */}
      <AnimatePresence>
        {lockedCourse && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setLockedCourse(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal card */}
            <motion.div
              className="relative bg-card border border-amber-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Close button */}
              <button
                onClick={() => setLockedCourse(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>

              {/* Animated lock icon */}
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

              <h2 className="text-xl font-serif font-bold text-foreground mb-2">
                This Course is Currently Locked
              </h2>
              <p className="text-sm text-muted-foreground mb-1 font-medium">"{lockedCourse.title}"</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-6">
                Our team is preparing this course for you. It will be available again soon. Check back later or explore our other courses in the meantime.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  className="gap-2 border-border text-sm"
                  onClick={() => setLockedCourse(null)}
                >
                  <Bell size={14} /> Noted, I'll check back
                </Button>
                <Button
                  className="bg-gradient-gold hover:opacity-90 text-sm gap-2"
                  onClick={() => setLockedCourse(null)}
                >
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

export default Courses;
