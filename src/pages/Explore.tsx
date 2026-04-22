import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter, Star, Clock, Bookmark, ChevronRight, ChevronLeft,
  Briefcase, BarChart3, Award, Users, FileText, Globe, FolderOpen,
  Play, Sparkles, Layers, Target, TrendingUp, Cpu, GraduationCap, CalendarDays, Search, X, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp, scaleIn } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useCourses } from "@/hooks/use-courses";
import { useMentors } from "@/hooks/use-mentors";
import { useBookmarks, useToggleBookmark } from "@/hooks/use-bookmarks";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/contexts/AuthContext";

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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  "Business Analysis": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", glow: "hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]" },
  "Project Management": { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", glow: "hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]" },
  "Agile & Scrum": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", glow: "hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]" },
  "Digital Transformation": { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", glow: "hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]" },
  "Business Strategy": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", glow: "hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]" },
  "Project Delivery": { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", glow: "hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]" },
  "Bid Writing": { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30", glow: "hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.5)]" },
  "Consulting & Leadership": { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30", glow: "hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]" },
};

const DEFAULT_COLOR = { bg: "bg-white/8", text: "text-white/60", border: "border-white/10", glow: "hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]" };

function useHScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };
  return { ref, scroll };
}

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const trending = useHScroll();
  const { user } = useAuth();

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearch(q);
  }, [searchParams]);

  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: mentors, isLoading: mentorsLoading } = useMentors();
  const { data: bookmarksData } = useBookmarks();
  const { data: enrollmentsData } = useEnrollments();
  const { data: categoriesData } = useCategories();
  const toggleBookmark = useToggleBookmark();

  const bookmarkedIds = (bookmarksData || []).map((b: any) => b.course_id);
  const enrolledCourses = (enrollmentsData || []).map((e: any) => ({
    ...e.courses,
    progress: e.progress,
  }));

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const q = search.toLowerCase().trim();
  const filteredCourses = (courses || []).filter((c) => {
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    const matchesSearch = !q ||
      c.title.toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q) ||
      (c.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const filteredMentors = (mentors || []).filter((m) =>
    !q ||
    m.name.toLowerCase().includes(q) ||
    (m.title || "").toLowerCase().includes(q) ||
    (m.specializations || []).some((s: string) => s.toLowerCase().includes(q))
  );

  const isSearching = !!q;

  return (
    <SidebarLayout>
      {/* Page header banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[hsl(163,36%,10%)]/92 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(163,40%,8%)]/80 via-[hsl(163,40%,8%)]/40 to-transparent" />
          <div className="absolute inset-0 grid-pattern opacity-25" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/8 blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-blue-500/8 blur-[60px]" />
        <div className="relative z-10 px-4 lg:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-md">
              <Compass size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-serif font-bold text-white text-shadow-lg">Explore</h1>
              <p className="text-xs text-white/80 text-shadow">Discover courses, categories and mentors</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto space-y-10">

        {/* Search + Filters */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={0} className="space-y-4">
          <form className="relative w-full max-w-xl" onSubmit={(e) => e.preventDefault()}>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value.trim()) setSearchParams({});
              }}
              placeholder="Search courses or mentors..."
              className="w-full pl-10 pr-10 py-2.5 glass border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(""); setSearchParams({}); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X size={15} />
              </button>
            )}
          </form>
          <div className="flex flex-wrap gap-2">
            <Select>
              <SelectTrigger className="w-[140px] h-9 glass border-white/10 text-sm text-white/70">
                <Filter size={14} className="mr-1 text-white/30" /><SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[120px] h-9 glass border-white/10 text-sm text-white/70">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">&lt; 10h</SelectItem>
                <SelectItem value="medium">10-30h</SelectItem>
                <SelectItem value="long">30h+</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
              <SelectTrigger className="w-[160px] h-9 glass border-white/10 text-sm text-white/70">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categoriesData || []).filter(c => c.name !== "General").map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* Trending / Filtered Courses */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              {isSearching ? (
                <><Search size={18} className="text-primary" /> Results for "{search}"</>
              ) : selectedCategory ? (
                <><FolderOpen size={18} className="text-primary" /> {selectedCategory}</>
              ) : (
                <><Sparkles size={18} className="text-primary" /> Trending Courses</>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <button onClick={() => setSelectedCategory("")} className="text-xs text-white/40 hover:text-primary underline transition-colors">Clear filter</button>
              )}
              <button onClick={() => trending.scroll("left")} className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => trending.scroll("right")} className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div ref={trending.ref} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            {coursesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[280px] max-w-[280px] snap-start flex-shrink-0">
                  <div className="glass rounded-xl border border-white/8 overflow-hidden h-full">
                    <Skeleton className="h-36 w-full rounded-none" />
                    <div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {filteredCourses.length === 0 && (
                  <div className="text-sm text-white/40 py-8 px-4">No courses found{isSearching ? ` for "${search}"` : ""}.</div>
                )}
                {filteredCourses.map((c) => (
                  <Link key={c.id} to={`/course/${c.id}`} className="min-w-[280px] max-w-[280px] snap-start flex-shrink-0">
                    <div className="glass rounded-xl border border-white/8 hover:border-primary/30 transition-all duration-300 card-lift h-full overflow-hidden">
                      <div className="h-36 bg-muted flex items-center justify-center relative overflow-hidden">
                        {c.thumbnail_url ? (
                          <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <span className="text-4xl">📘</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(163,36%,10%)]/60 to-transparent" />
                        <Badge className="absolute top-2 left-2 bg-primary/80 text-white text-[10px] px-2 py-0.5 backdrop-blur-sm">{c.category}</Badge>
                        <Badge className="absolute bottom-2 left-2 glass text-white text-[10px] px-2 py-0.5">
                          {(c as any).course_type === "live" ? "🔴 Live" : (c as any).course_type === "book" ? "📚 Book" : "📹 Video"}
                        </Badge>
                        {user && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark.mutate(c.id); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center hover:border-primary/40 transition-all"
                          >
                            <Bookmark size={13} className={bookmarkedIds.includes(c.id) ? "fill-primary text-primary" : "text-white/50"} />
                          </button>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2">{c.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Clock size={11} />{c.total_duration}</span>
                          <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" />{c.rating}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || []).slice(0, 2).map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/40 border border-white/8">{t}</span>
                          ))}
                        </div>
                        <p className="text-base font-bold text-gradient-gold">{c.price > 0 ? `£${c.price}` : "Free"}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </motion.section>

        {/* Categories */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-white">Browse Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
            {(categoriesData || []).filter(c => c.name !== "General").map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.name] || FolderOpen;
              const isActive = selectedCategory === cat.name;
              const colors = CATEGORY_COLORS[cat.name] || DEFAULT_COLOR;
              return (
                <motion.button
                  key={cat.id}
                  initial="hidden" animate="visible" variants={scaleIn} custom={i}
                  onClick={() => setSelectedCategory(isActive ? "" : cat.name)}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 card-lift ${
                    isActive
                      ? `${colors.bg} ${colors.border} ${colors.glow}`
                      : `glass border-white/8 hover:${colors.border} ${colors.glow}`
                  }`}
                >
                  <Icon size={22} className={isActive ? colors.text : `text-white/40 group-hover:${colors.text} transition-colors`} />
                  <span className={`text-[11px] font-medium text-center leading-tight transition-colors ${isActive ? colors.text : "text-white/40 group-hover:text-white"}`}>{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Continue Learning */}
        {enrolledCourses.length > 0 && (
          <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3} className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-lg font-serif font-bold text-white">Continue Learning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enrolledCourses.slice(0, 3).map((c: any, i: number) => (
                <motion.div key={c.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Link to={`/course/${c.id}`}>
                    <div className="glass rounded-xl border border-white/8 hover:border-primary/30 transition-all duration-300 card-lift p-5 space-y-3">
                      <h3 className="font-semibold text-sm text-white leading-snug">{c.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Star size={12} className="text-amber-400 fill-amber-400" />{c.rating}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-white/40">
                          <span>Progress</span><span>{c.progress}%</span>
                        </div>
                        <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                          />
                        </div>
                      </div>
                      <Button size="sm" className="w-full gap-1 text-xs bg-gradient-gold hover:opacity-90">
                        <Play size={12} /> {c.progress > 0 ? "Continue Learning" : "Start Course"}
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Mentors */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={4} className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-white">
            {isSearching ? "Matching Mentors" : "Mentors to Connect With"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mentorsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-xl border border-white/8 p-5 flex flex-col items-center space-y-3">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : filteredMentors.length === 0 ? (
              <p className="col-span-4 text-sm text-white/40 py-4">No mentors found{isSearching ? ` for "${search}"` : ""}.</p>
            ) : (
              filteredMentors.map((m, i) => (
                <motion.div key={m.id} initial="hidden" animate="visible" variants={scaleIn} custom={i}>
                  <Link to={`/mentor/${m.id}`}>
                    <div className="glass rounded-xl border border-white/8 hover:border-primary/30 transition-all duration-300 card-lift p-5 flex flex-col items-center text-center space-y-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-amber-500/20 border-2 border-primary/30 text-primary flex items-center justify-center text-lg font-bold">
                          {getInitials(m.name)}
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-primary/10 scale-125" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-white">{m.name}</h3>
                        <p className="text-xs text-white/40">{m.title}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{m.years_experience} yrs experience</p>
                      </div>
                      <Button size="sm" className="w-full text-xs gap-1 bg-gradient-gold hover:opacity-90">
                        <CalendarDays size={12} /> View Profile
                      </Button>
                    </div>
                  </Link>
                </motion.div>
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
