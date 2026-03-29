import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, BookOpen, Star, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";
import { useCourses } from "@/hooks/use-courses";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermediate: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Advanced: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const Courses = () => {
  const { data: courses, isLoading } = useCourses();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    if (!courses) return [];
    const counts: Record<string, number> = {};
    courses.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    if (activeCategory === "All") return courses;
    return courses.filter((c) => c.category === activeCategory);
  }, [courses, activeCategory]);

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

      {/* Category filters */}
      <section className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
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
              filtered.map((course, i) => (
                <motion.div key={course.id} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 6} variants={fadeUp}>
                  <Card className="bg-card border-border hover:border-primary/40 transition-all duration-300 hover:shadow-gold h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="h-44 bg-muted rounded-t-lg overflow-hidden shrink-0">
                      {(course as any).thumbnail_url ? (
                        <img src={(course as any).thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <BookOpen size={36} className="text-primary/40" />
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
                      <Button size="sm" asChild className="bg-gradient-gold hover:opacity-90 text-xs gap-1">
                        <Link to={`/course/${course.id}`}>
                          View Course <ArrowRight size={13} />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Courses;
