import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Eye, EyeOff, Newspaper, Clock, Star } from "lucide-react";
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
  is_featured: boolean;
  created_at: string;
  author_name: string | null;
  author_role: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const AdminArticles = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate("/");
  }, [user, loading, navigate]);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () => api.get<Article[]>("/api/articles/admin/all"),
    enabled: !!user && user.role === "admin",
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/api/articles/${id}`, { published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-articles"] }),
    onError: () => toast({ title: "Error", description: "Could not update article.", variant: "destructive" }),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, is_featured }: { id: string; is_featured: boolean }) =>
      api.patch(`/api/articles/${id}`, { is_featured }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      qc.invalidateQueries({ queryKey: ["featured-articles"] });
    },
    onError: () => toast({ title: "Error", description: "Could not update featured status.", variant: "destructive" }),
  });

  const deleteArticle = useMutation({
    mutationFn: (id: string) => api.delete(`/api/articles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      qc.invalidateQueries({ queryKey: ["featured-articles"] });
      toast({ title: "Deleted", description: "Article removed." });
    },
    onError: () => toast({ title: "Error", description: "Could not delete article.", variant: "destructive" }),
  });

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <Newspaper size={22} className="text-primary" /> Articles
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage blog posts · Star an article to feature it on the dashboard
            </p>
          </div>
          <Link to="/admin/articles/new">
            <Button className="bg-gradient-gold hover:opacity-90 gap-1.5">
              <Plus size={15} /> New Article
            </Button>
          </Link>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
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
                <p className="text-muted-foreground text-sm">No articles yet. Create your first one!</p>
                <Link to="/admin/articles/new">
                  <Button className="mt-4 bg-gradient-gold hover:opacity-90 gap-1.5">
                    <Plus size={15} /> Write an Article
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
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-medium text-foreground text-sm truncate">{article.title}</p>
                        {article.is_featured && (
                          <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30 border shrink-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{formatDate(article.created_at)}</span>
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Clock size={10} /> {article.read_time_minutes} min
                        </span>
                        <span className="text-xs text-muted-foreground">
                          by {article.author_name || "—"} ({article.author_role || "admin"})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-8 w-8 ${article.is_featured ? "text-amber-400 hover:text-amber-300" : "text-muted-foreground hover:text-amber-400"}`}
                        title={article.is_featured ? "Unfeature" : "Feature on dashboard"}
                        onClick={() => toggleFeatured.mutate({ id: article.id, is_featured: !article.is_featured })}
                      >
                        <Star size={14} className={article.is_featured ? "fill-amber-400" : ""} />
                      </Button>
                      <Badge
                        variant={article.published ? "default" : "outline"}
                        className={`text-[10px] cursor-pointer ${article.published ? "bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30" : "border-muted-foreground/30 hover:bg-muted"}`}
                        onClick={() => togglePublish.mutate({ id: article.id, published: !article.published })}
                      >
                        {article.published
                          ? <><Eye size={9} className="mr-1" />Published</>
                          : <><EyeOff size={9} className="mr-1" />Draft</>}
                      </Badge>
                      <Link to={`/admin/articles/${article.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary">
                          <Edit2 size={14} />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this article?")) deleteArticle.mutate(article.id);
                        }}
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

export default AdminArticles;
