import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight, BookOpen, SlidersHorizontal, ArrowDownAZ, ArrowUpAZ, Hash, Lock, X, Bell, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/Layout";
import { fadeUp, scaleIn } from "@/lib/animations";
import { useCourses } from "@/hooks/use-courses";

type SortOption = "numeric" | "az" | "za";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Intermediate: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Advanced: "bg-purple-500/15 text-purple-400 border-purple-500/25",
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
      {/* Hero Header */}
      <section className="relative py-20 lg:py-28 overflow-hidden -mt-[72px] pt-[72px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[hsl(163,36%,8%)]/93 backdrop-blur-[3px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(163,40%,8%)]/90 via-[hsl(163,40%,8%)]/60 to-[hsl(163,40%,8%)]/30" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/6 blur-[100px]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/30 mb-4 backdrop-blur-md">
              <GraduationCap size={13} className="text-primary" />
              <span className="text-primary font-semibold tracking-[0.2em] uppercase text-xs">HTB Consult Academy</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 text-shadow-lg">
              Practical Training for <em className="text-gradient-gold not-italic">Professional Growth</em>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-white/85 max-w-2xl leading-relaxed text-shadow">
              Practical skills training in business analysis, project delivery, digital transformation, and professional development — built from real consulting experience.
            </motion.p>
            {!isLoading && courses && (
              <motion.div variants={fadeUp} custom={3} className="flex items-center gap-2 mt-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/15 backdrop-blur-md">
                  <BookOpen size={13} className="text-white/70" />
                  <span className="text-xs text-white/85">{courses.length} courses available</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Sticky filter bar */}
      <section className="bg-[hsl(163,36%,14%)]/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 py-3">
            <SlidersHorizontal size={14} className="text-white/30 shrink-0" />
            <div className="flex items-center gap-2 flex-1 overflow-x-auto min-w-0" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setActiveCategory("All")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === "All"
                    ? "bg-primary text-white glow-gold"
                    : "glass border border-white/10 text-white/50 hover:text-white hover:border-white/20"
                }`}
              >
                All ({courses?.length ?? 0})
              </button>
              {categories.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-primary text-white"
                      : "glass border border-white/10 text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>
            <div className="shrink-0 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium glass border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all whitespace-nowrap">
                    {sortBy === "numeric" && <Hash size={12} />}
                    {sortBy === "az" && <ArrowDownAZ size={12} />}
                    {sortBy === "za" && <ArrowUpAZ size={12} />}
                    {SORT_LABELS[sortBy]}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <DropdownMenuRadioItem value="numeric" className="text-xs gap-2"><Hash size={12} /> Numeric</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="az" className="text-xs gap-2"><ArrowDownAZ size={12} /> A → Z</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="za" className="text-xs gap-2"><ArrowUpAZ size={12} /> Z → A</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-12 lg:py-16 relative">
        <div className="absolute inset-0 bg-[hsl(163,36%,14%)]" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-white/20" />
              </div>
              <p className="text-white/40 mb-2">No courses in this category yet.</p>
              <button onClick={() => setActiveCategory("All")} className="text-primary text-sm hover:underline">View all courses</button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-xl border border-white/8 overflow-hidden">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))
            ) : (
              filtered.map((course, i) => {
                const isLocked = !!course.is_locked;
                return (
                  <motion.div key={course.id} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 6} variants={fadeUp} className="card-lift">
                    <div className={`glass rounded-xl border overflow-hidden h-full flex flex-col transition-all duration-300 ${isLocked ? "border-white/5 opacity-75" : "border-white/8 hover:border-primary/30 hover:shadow-[0_20px_60px_-15px_rgba(234,119,0,0.2)]"}`}>
                      {/* Thumbnail */}
                      <div className="h-44 bg-muted overflow-hidden shrink-0 relative">
                        {(course as any).thumbnail_url ? (
                          <img src={(course as any).thumbnail_url} alt={course.title} className={`w-full h-full object-cover transition-transform duration-700 ${isLocked ? "grayscale" : "hover:scale-105"}`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <BookOpen size={36} className="text-primary/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(163,36%,10%)]/60 to-transparent" />
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                              <Lock size={22} className="text-amber-400" />
                            </div>
                            <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">Locked</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary border border-primary/20">{course.category}</span>
                          {(course as any).skill_level && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${LEVEL_COLORS[(course as any).skill_level] || ""}`}>
                              {(course as any).skill_level}
                            </span>
                          )}
                          {(course as any).course_type === "live" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">🔴 Live</span>
                          )}
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Lock size={9} /> Locked
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-white mb-2 leading-snug">{course.title}</h3>
                        <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-3 flex-1">{course.description}</p>
                        <div className="flex items-center gap-4 text-xs text-white/35">
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.total_duration}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(course.tags || []).slice(0, 3).map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/35 border border-white/8">{t}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between">
                        <span className="text-xl font-bold text-gradient-gold">
                          {(course as any).price > 0 ? `£${(course as any).price}` : "Free"}
                        </span>
                        {isLocked ? (
                          <Button size="sm" variant="outline" className="text-xs gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            onClick={() => setLockedCourse({ title: course.title, category: course.category })}>
                            <Lock size={12} /> Locked
                          </Button>
                        ) : (
                          <Button size="sm" asChild className="bg-gradient-gold hover:opacity-90 text-xs gap-1 btn-shimmer">
                            <Link to={`/course/${course.id}`}>View Course <ArrowRight size={13} /></Link>
                          </Button>
                        )}
                      </div>
                    </div>
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
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setLockedCourse(null)} />
            <motion.div
              className="relative glass-dark border border-amber-500/25 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center glow-gold"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button onClick={() => setLockedCourse(null)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"><X size={18} /></button>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                    <Lock size={36} className="text-amber-400" />
                  </div>
                  <motion.div className="absolute inset-0 rounded-full border-2 border-amber-500/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 mb-3">{lockedCourse.category}</Badge>
              <h2 className="text-xl font-serif font-bold text-white mb-2">This Course is Currently Locked</h2>
              <p className="text-sm text-white/50 font-medium mb-1">"{lockedCourse.title}"</p>
              <p className="text-sm text-white/40 leading-relaxed mt-3 mb-6">
                Our team is preparing this course for you. It will be available again soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="gap-2 border-white/10 text-white/60 hover:text-white text-sm" onClick={() => setLockedCourse(null)}>
                  <Bell size={14} /> Noted, I'll check back
                </Button>
                <Button className="bg-gradient-gold hover:opacity-90 text-sm gap-2 btn-shimmer" onClick={() => setLockedCourse(null)}>
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
