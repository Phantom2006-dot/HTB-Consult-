import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter, Star, Clock, Bookmark, ChevronRight, ChevronLeft,
  Briefcase, BarChart3, Award, Users, FileText, Globe, FolderOpen,
  Play, Sparkles, Layers, Target, TrendingUp, Cpu, GraduationCap,
  CalendarDays, Search, X, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import SidebarLayout from "@/components/SidebarLayout";
import { useCourses } from "@/hooks/use-courses";
import { useMentors } from "@/hooks/use-mentors";
import { useBookmarks, useToggleBookmark } from "@/hooks/use-bookmarks";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/contexts/AuthContext";
import { useRef } from "react";

/* ── Constants ────────────────────────────────────────────── */
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

const CATEGORY_ACCENT: Record<string, { active: string; icon: string; border: string }> = {
  "Business Analysis":      { active: "bg-blue-600/20 border-blue-500/40",    icon: "text-blue-400",   border: "hover:border-blue-500/30" },
  "Project Management":     { active: "bg-amber-600/20 border-amber-500/40",  icon: "text-amber-400",  border: "hover:border-amber-500/30" },
  "Agile & Scrum":          { active: "bg-purple-600/20 border-purple-500/40",icon: "text-purple-400", border: "hover:border-purple-500/30" },
  "Digital Transformation": { active: "bg-cyan-600/20 border-cyan-500/40",    icon: "text-cyan-400",   border: "hover:border-cyan-500/30" },
  "Business Strategy":      { active: "bg-emerald-600/20 border-emerald-500/40",icon:"text-emerald-400",border: "hover:border-emerald-500/30" },
  "Project Delivery":       { active: "bg-orange-600/20 border-orange-500/40",icon: "text-orange-400", border: "hover:border-orange-500/30" },
  "Bid Writing":            { active: "bg-rose-600/20 border-rose-500/40",    icon: "text-rose-400",   border: "hover:border-rose-500/30" },
  "Consulting & Leadership":{ active: "bg-indigo-600/20 border-indigo-500/40",icon: "text-indigo-400", border: "hover:border-indigo-500/30" },
};
const DEFAULT_ACCENT = { active: "bg-white/10 border-white/20", icon: "text-white/50", border: "hover:border-white/20" };

function useHScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  return { ref, scroll };
}

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06, ease: "easeOut" } }),
};

/* ── Component ────────────────────────────────────────────── */
const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const trending = useHScroll();
  const { user } = useAuth();

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

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const q = search.toLowerCase().trim();

  const filteredCourses = (courses || []).filter((c) => {
    const matchCat = !selectedCategory || c.category === selectedCategory;
    const matchSkill = !skillFilter || c.skill_level?.toLowerCase() === skillFilter;
    const matchQ =
      !q ||
      c.title.toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q) ||
      (c.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSkill && matchQ;
  });

  const filteredMentors = (mentors || []).filter(
    (m) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      (m.title || "").toLowerCase().includes(q) ||
      (m.specializations || []).some((s: string) => s.toLowerCase().includes(q))
  );

  const isSearching = !!q;
  const hasFilter = !!selectedCategory || !!skillFilter;

  return (
    <SidebarLayout>

      {/* ── Page header — solid bg, zero blur ──────────────────── */}
      <div
        className="px-4 lg:px-8 py-7 border-b border-border"
        style={{ background: "hsl(var(--section-alt))" }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={0}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Compass size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">Explore</h1>
            <p className="text-xs text-muted-foreground">Discover courses, categories and mentors</p>
          </div>
        </motion.div>
      </div>

      <div className="px-4 lg:px-8 py-6 space-y-10 max-w-6xl mx-auto">

        {/* ── Search + Filters ────────────────────────────────── */}
        <motion.section initial="hidden" animate="visible" variants={fadeIn} custom={0} className="space-y-3">
          <div className="relative w-full max-w-lg">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value.trim()) setSearchParams({});
              }}
              placeholder="Search courses or mentors…"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSearchParams({}); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={skillFilter} onValueChange={(v) => setSkillFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[140px] h-9 bg-card border-border text-sm text-muted-foreground">
                <Filter size={13} className="mr-1 text-muted-foreground/60 shrink-0" />
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[170px] h-9 bg-card border-border text-sm text-muted-foreground">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categoriesData || []).filter((c) => c.name !== "General").map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(hasFilter || isSearching) && (
              <button
                onClick={() => { setSelectedCategory(""); setSkillFilter(""); setSearch(""); setSearchParams({}); }}
                className="h-9 px-3 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </motion.section>

        {/* ── Courses ─────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={1}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-foreground flex items-center gap-2">
              {isSearching ? (
                <><Search size={16} className="text-primary" /> Results for &ldquo;{search}&rdquo;</>
              ) : selectedCategory ? (
                <><FolderOpen size={16} className="text-primary" /> {selectedCategory}</>
              ) : (
                <><Sparkles size={16} className="text-primary" /> Trending Courses</>
              )}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => trending.scroll("left")}
                className="w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => trending.scroll("right")}
                className="w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div
            ref={trending.ref}
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {coursesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[270px] max-w-[270px] snap-start shrink-0">
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <Skeleton className="h-36 w-full rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredCourses.length === 0 ? (
              <div className="py-10 text-sm text-muted-foreground">
                No courses found{isSearching ? ` for "${search}"` : ""}.
              </div>
            ) : (
              filteredCourses.map((c) => (
                <Link
                  key={c.id}
                  to={`/course/${c.id}`}
                  className="min-w-[270px] max-w-[270px] snap-start shrink-0"
                >
                  <div className="rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full overflow-hidden">
                    {/* Thumbnail */}
                    <div className="h-36 bg-muted relative overflow-hidden">
                      {c.thumbnail_url ? (
                        <img
                          src={c.thumbnail_url}
                          alt={c.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-muted">
                          📘
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 shadow-sm">
                        {c.category}
                      </Badge>
                      <Badge className="absolute bottom-2 left-2 bg-card/90 text-foreground text-[10px] px-2 py-0.5 border border-border/60">
                        {(c as any).course_type === "live" ? "🔴 Live" : (c as any).course_type === "book" ? "📚 Book" : "📹 Video"}
                      </Badge>
                      {user && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark.mutate(c.id); }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-md border border-border bg-card/90 flex items-center justify-center hover:border-primary/40 transition-colors"
                        >
                          <Bookmark
                            size={13}
                            className={bookmarkedIds.includes(c.id) ? "fill-primary text-primary" : "text-muted-foreground"}
                          />
                        </button>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">{c.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={11} />{c.total_duration || "—"}</span>
                        <span className="flex items-center gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          {c.rating || "—"}
                        </span>
                        <span className="capitalize">{c.skill_level}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-gradient-gold pt-0.5">
                        {c.price > 0 ? `£${Number(c.price).toLocaleString()}` : "Free"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.section>

        {/* ── Browse Categories ────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          custom={0}
          className="space-y-4"
        >
          <h2 className="text-base font-serif font-bold text-foreground">Browse Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
            {(categoriesData || []).filter((c) => c.name !== "General").map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.name] || FolderOpen;
              const isActive = selectedCategory === cat.name;
              const accent = CATEGORY_ACCENT[cat.name] || DEFAULT_ACCENT;
              return (
                <motion.button
                  key={cat.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  custom={i * 0.5}
                  onClick={() => setSelectedCategory(isActive ? "" : cat.name)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors duration-200 ${
                    isActive
                      ? `${accent.active}`
                      : `bg-card border-border ${accent.border}`
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? accent.icon : `text-muted-foreground`}
                  />
                  <span className={`text-[10px] font-medium text-center leading-tight ${isActive ? accent.icon : "text-muted-foreground"}`}>
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* ── Continue Learning ────────────────────────────────── */}
        {enrolledCourses.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
            className="space-y-4"
          >
            <h2 className="text-base font-serif font-bold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> Continue Learning
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.slice(0, 3).map((c: any, i: number) => (
                <motion.div
                  key={c.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  custom={i * 0.5}
                >
                  <Link to={`/course/${c.id}`}>
                    <div className="rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 p-5 space-y-3">
                      <h3 className="font-semibold text-sm text-foreground leading-snug">{c.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        {c.rating || "—"}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Progress</span><span>{c.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${c.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                          />
                        </div>
                      </div>
                      <Button size="sm" className="w-full gap-1.5 text-xs bg-gradient-gold hover:opacity-90 font-semibold">
                        <Play size={11} /> {c.progress > 0 ? "Continue" : "Start"}
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Mentors ──────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          custom={0}
          className="space-y-4"
        >
          <h2 className="text-base font-serif font-bold text-foreground">
            {isSearching ? "Matching Mentors" : "Mentors to Connect With"}
          </h2>

          {mentorsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-3">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : filteredMentors.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No mentors found{isSearching ? ` for "${search}"` : ""}.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMentors.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  custom={i * 0.4}
                >
                  <Link to={`/mentor/${m.id}`}>
                    <div className="rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 p-5 flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-primary/15 border-2 border-primary/30 text-primary flex items-center justify-center text-base font-bold shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{m.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{m.years_experience} yrs exp</p>
                      </div>
                      <Button size="sm" className="w-full text-xs gap-1.5 bg-gradient-gold hover:opacity-90 font-semibold">
                        <CalendarDays size={11} /> View Profile
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        <div className="pb-8" />
      </div>
    </SidebarLayout>
  );
};

export default Explore;
