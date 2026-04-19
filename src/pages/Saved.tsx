import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Clock, Star, Trash2, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp, scaleIn } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { useBookmarks, useToggleBookmark } from "@/hooks/use-bookmarks";

const Saved = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: bookmarks, isLoading } = useBookmarks();
  const toggleBookmark = useToggleBookmark();

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

  const items = bookmarks || [];

  return (
    <SidebarLayout>
      {/* Page banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[hsl(163,36%,8%)]/90" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/7 blur-[60px]" />
        <div className="relative z-10 px-4 lg:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Bookmark size={18} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-serif font-bold text-white">Saved Items</h1>
              <p className="text-xs text-white/40">{items.length} course{items.length !== 1 ? "s" : ""} saved</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-xl border border-white/8 p-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl glass border border-amber-500/20 flex items-center justify-center mx-auto">
                <Heart size={32} className="text-amber-400/50" />
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/10 scale-125 animate-ping" style={{ animationDuration: "3s" }} />
            </div>
            <h2 className="text-lg font-serif font-semibold text-white mb-2">No saved items yet</h2>
            <p className="text-sm text-white/40 mb-6 max-w-xs">Browse courses and bookmark the ones you're interested in to find them here.</p>
            <Button onClick={() => navigate("/explore")} className="bg-gradient-gold hover:opacity-90 btn-shimmer">
              <BookOpen size={15} className="mr-2" /> Explore Courses
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any, i: number) => {
              const course = item.courses;
              if (!course) return null;
              return (
                <motion.div key={item.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <div className="glass rounded-xl border border-white/8 hover:border-amber-500/20 transition-all duration-300 card-lift">
                    <div className="p-4 flex flex-col sm:flex-row gap-4">
                      <div
                        className="w-full sm:w-32 h-24 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl flex items-center justify-center shrink-0 cursor-pointer overflow-hidden relative"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <BookOpen size={28} className="text-amber-400/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2 cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                        <h3 className="font-semibold text-sm text-white hover:text-primary transition-colors">{course.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.total_duration}</span>
                          <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {course.rating}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary border border-primary/20">{course.category}</span>
                        </div>
                        <p className="text-sm font-bold text-gradient-gold">{course.price > 0 ? `£${course.price}` : "Free"}</p>
                      </div>
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <Button size="sm" className="text-xs bg-gradient-gold hover:opacity-90" onClick={() => navigate(`/course/${course.id}`)}>
                          View
                        </Button>
                        <button
                          onClick={() => toggleBookmark.mutate(course.id)}
                          className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Saved;
