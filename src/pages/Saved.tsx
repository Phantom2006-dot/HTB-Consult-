import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Clock, Star, User, Trash2, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
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
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark size={20} className="text-primary" />
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground">Saved Items</h1>
          </div>
          <p className="text-sm text-muted-foreground">{items.length} courses saved</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border bg-card"><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={48} className="text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No saved items yet</h2>
            <p className="text-sm text-muted-foreground mb-4">Browse courses and bookmark the ones you're interested in.</p>
            <Button onClick={() => navigate("/explore")}>Explore Courses</Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any, i: number) => {
              const course = item.courses;
              if (!course) return null;
              return (
                <motion.div key={item.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                  <Card className="border-border bg-card hover:border-primary/30 transition-all duration-200">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-32 h-24 bg-secondary/50 rounded-lg flex items-center justify-center shrink-0 cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                        <BookOpen size={28} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2 cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                        <h3 className="font-semibold text-sm text-foreground">{course.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.total_duration}</span>
                          <span className="flex items-center gap-1"><Star size={12} className="text-primary fill-primary" /> {course.rating}</span>
                          <Badge variant="secondary" className="text-[10px]">{course.category}</Badge>
                        </div>
                        <p className="text-sm font-bold text-foreground">{course.price > 0 ? `£${course.price}` : "Free"}</p>
                      </div>
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate(`/course/${course.id}`)}>
                          View
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => toggleBookmark.mutate(course.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
