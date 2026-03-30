import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, User, Newspaper, Star, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  read_time_minutes: number;
  is_featured: boolean;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  author_role: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const Blog = () => {
  const [search, setSearch] = useState("");

  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles-public"],
    queryFn: () => api.get<Article[]>("/api/articles"),
  });

  const filtered = (articles || []).filter((a) =>
    !search.trim() ||
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.excerpt || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.author_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const featured = filtered.filter((a) => a.is_featured);
  const rest = filtered.filter((a) => !a.is_featured);

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper size={20} className="text-primary" />
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground">Blog</h1>
          </div>
          <p className="text-muted-foreground text-sm">Insights, guides and updates from the HTB Consult team</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-card border-border overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <CardContent className="p-5 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-center py-20 text-muted-foreground">
            <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? "No articles match your search." : "No articles published yet. Check back soon!"}</p>
          </motion.div>
        ) : (
          <>
            {featured.length > 0 && !search && (
              <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star size={16} className="text-amber-400 fill-amber-400" /> Featured
                </h2>
                {featured.length === 1 ? (
                  <Link to={`/blog/${featured[0].slug}`}>
                    <Card className="bg-card border-border hover:border-primary/40 transition-colors group overflow-hidden">
                      <div className="grid md:grid-cols-2 gap-0">
                        {featured[0].cover_image_url ? (
                          <div className="overflow-hidden h-56 md:h-72">
                            <img
                              src={featured[0].cover_image_url}
                              alt={featured[0].title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="h-56 md:h-72 bg-gradient-to-br from-primary/20 via-primary/5 to-muted flex items-center justify-center">
                            <Newspaper size={40} className="text-primary/40" />
                          </div>
                        )}
                        <CardContent className="p-6 flex flex-col justify-center space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30 border">Featured</Badge>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock size={11} /> {featured[0].read_time_minutes} min read
                            </span>
                          </div>
                          <h2 className="font-serif font-bold text-xl text-foreground leading-snug group-hover:text-primary transition-colors">
                            {featured[0].title}
                          </h2>
                          {featured[0].excerpt && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{featured[0].excerpt}</p>
                          )}
                          <div className="flex items-center gap-2 pt-2">
                            {featured[0].author_avatar ? (
                              <img src={featured[0].author_avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                                <User size={13} className="text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {featured[0].author_name || "HTB Team"} · {formatDate(featured[0].created_at)}
                            </span>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {featured.map((article, i) => (
                      <ArticleCard key={article.id} article={article} index={i} />
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {rest.length > 0 && (
              <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3}>
                {featured.length > 0 && !search && (
                  <h2 className="text-base font-semibold text-foreground mb-4">Latest Articles</h2>
                )}
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {(search ? filtered : rest).map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                  ))}
                </div>
              </motion.section>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={index}>
      <Link to={`/blog/${article.slug}`}>
        <Card className="bg-card border-border hover:border-primary/40 transition-colors group overflow-hidden h-full flex flex-col">
          {article.cover_image_url ? (
            <div className="overflow-hidden h-44 shrink-0">
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="h-44 bg-gradient-to-br from-primary/20 via-primary/5 to-muted flex items-center justify-center shrink-0">
              <Newspaper size={32} className="text-primary/40" />
            </div>
          )}
          <CardContent className="p-4 space-y-3 flex flex-col flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {article.is_featured && (
                <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30 border">Featured</Badge>
              )}
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary capitalize">
                {article.author_role === "admin" ? "HTB Team" : "Mentor"}
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock size={11} />
                {article.read_time_minutes} min read
              </span>
            </div>
            <h2 className="font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-2 pt-1 mt-auto">
              {article.author_avatar ? (
                <img src={article.author_avatar} alt={article.author_name || ""} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <User size={12} className="text-muted-foreground" />
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                {article.author_name || "HTB Team"} · {formatDate(article.created_at)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default Blog;
