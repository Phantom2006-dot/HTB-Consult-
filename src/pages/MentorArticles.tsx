import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Eye, EyeOff, Newspaper, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  read_time_minutes: number;
  published: boolean;
  created_at: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const MentorArticles = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "mentor" && user.role !== "admin"))) navigate("/");
  }, [user, loading, navigate]);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["mentor-articles"],
    queryFn: () => api.get<Article[]>("/api/articles/mentor/mine"),
    enabled: !!user && (user.role === "mentor" || user.role === "admin"),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/api/articles/${id}`, { published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mentor-articles"] }),
    onError: () => toast({ title: "Error", description: "Could not update article.", variant: "destructive" }),
  });

  const deleteArticle = useMutation({
    mutationFn: (id: string) => api.delete(`/api/articles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mentor-articles"] });
      toast({ title: "Deleted", description: "Article removed." });
    },
    onError: () => toast({ title: "Error", description: "Could not delete article.", variant: "destructive" }),
  });

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <Newspaper size={22} className="text-primary" /> My Articles
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Write and manage your blog posts</p>
          </div>
          <Link to="/mentor/articles/new">
            <Button className="bg-gradient-gold hover:opacity-90 gap-1.5">
              <Plus size={15} /> New Article
            </Button>
          </Link>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4 flex gap-3">
                  <Skeleton className="h-16 w-24 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !articles || articles.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <Newspaper size={36} className="mx-auto text-muted-foreground mb-3 opacity-30" />
                <p className="text-muted-foreground text-sm">You haven't written any articles yet.</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Share your expertise with the HTB Consult community.</p>
                <Link to="/mentor/articles/new">
                  <Button className="bg-gradient-gold hover:opacity-90 gap-1.5">
                    <Plus size={15} /> Write your first article
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            articles.map((article, i) => (
              <motion.div key={article.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {article.cover_image_url ? (
                        <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Newspaper size={18} className="text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{article.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{formatDate(article.created_at)}</span>
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Clock size={10} /> {article.read_time_minutes} min read
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={article.published ? "default" : "outline"}
                        className={`text-[10px] cursor-pointer ${article.published ? "bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30" : "border-muted-foreground/30 hover:bg-muted"}`}
                        onClick={() => togglePublish.mutate({ id: article.id, published: !article.published })}
                      >
                        {article.published
                          ? <><Eye size={9} className="mr-1" />Published</>
                          : <><EyeOff size={9} className="mr-1" />Draft</>}
                      </Badge>
                      {article.published && (
                        <Link to={`/blog/${article.slug}`} target="_blank">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" title="View on blog">
                            <Eye size={14} />
                          </Button>
                        </Link>
                      )}
                      <Link to={`/mentor/articles/${article.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary">
                          <Edit2 size={14} />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => { if (confirm("Delete this article?")) deleteArticle.mutate(article.id); }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default MentorArticles;
