import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, User, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  read_time_minutes: number;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  author_role: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const Blog = () => {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles-public"],
    queryFn: () => api.get<Article[]>("/api/articles"),
  });

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper size={20} className="text-primary" />
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground">Blog</h1>
          </div>
          <p className="text-muted-foreground text-sm">Insights, guides and updates from the HTB Consult team</p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !articles || articles.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-center py-20 text-muted-foreground">
            <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No articles published yet. Check back soon!</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article, i) => (
              <motion.div key={article.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                <Link to={`/blog/${article.slug}`}>
                  <Card className="bg-card border-border hover:border-primary/40 transition-colors group overflow-hidden h-full">
                    {article.cover_image_url ? (
                      <div className="overflow-hidden h-44">
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-primary/20 via-primary/5 to-muted flex items-center justify-center">
                        <Newspaper size={32} className="text-primary/40" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary capitalize">
                          {article.author_role === "admin" ? "HTB Team" : "Mentor"}
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock size={11} />
                          {article.read_time_minutes} min read
                        </span>
                      </div>
                      <h2 className="font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
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
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Blog;
