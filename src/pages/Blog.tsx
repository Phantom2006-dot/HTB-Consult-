import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, User, Newspaper, Star, Search, PenLine, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { fadeUp, scaleIn } from "@/lib/animations";
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
      {/* Page banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[hsl(163,36%,8%)]/88" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-blue-500/7 blur-[70px]" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-primary/6 blur-[50px]" />
        <div className="relative z-10 px-4 lg:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <PenLine size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-serif font-bold text-white">Blog</h1>
              <p className="text-xs text-white/40">Insights, guides and updates from the HTB Consult team</p>
            </div>
          </motion.div>

          {/* Search inside banner */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2.5 glass border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all"
            />
          </motion.div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-8">
        {isLoading ? (
          <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-xl border border-white/8 overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-3">
              <Newspaper size={22} className="text-white/20" />
            </div>
            <p className="text-sm text-white/40">{search ? "No articles match your search." : "No articles published yet. Check back soon!"}</p>
          </motion.div>
        ) : (
          <>
            {/* Featured Section */}
            {featured.length > 0 && !search && (
              <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Featured</h2>
                </div>
                {featured.length === 1 ? (
                  <Link to={`/blog/${featured[0].slug}`}>
                    <div className="glass rounded-xl border border-amber-500/15 hover:border-amber-500/30 transition-all duration-300 card-lift overflow-hidden group">
                      <div className="grid md:grid-cols-2 gap-0">
                        {featured[0].cover_image_url ? (
                          <div className="overflow-hidden h-56 md:h-72">
                            <img
                              src={featured[0].cover_image_url}
                              alt={featured[0].title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        ) : (
                          <div className="h-56 md:h-72 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent flex items-center justify-center">
                            <Newspaper size={40} className="text-amber-400/30" />
                          </div>
                        )}
                        <div className="p-6 flex flex-col justify-center space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/25 border">Featured</Badge>
                            <span className="flex items-center gap-1 text-[11px] text-white/35">
                              <Clock size={11} /> {featured[0].read_time_minutes} min read
                            </span>
                          </div>
                          <h2 className="font-serif font-bold text-xl text-white leading-snug group-hover:text-gradient-gold transition-all">
                            {featured[0].title}
                          </h2>
                          {featured[0].excerpt && (
                            <p className="text-sm text-white/45 leading-relaxed line-clamp-3">{featured[0].excerpt}</p>
                          )}
                          <div className="glow-line" />
                          <div className="flex items-center gap-2">
                            {featured[0].author_avatar ? (
                              <img src={featured[0].author_avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full glass border border-white/10 flex items-center justify-center">
                                <User size={13} className="text-white/40" />
                              </div>
                            )}
                            <span className="text-xs text-white/40">
                              {featured[0].author_name || "HTB Team"} · {formatDate(featured[0].created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
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

            {/* Rest of articles */}
            {rest.length > 0 && (
              <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={3}>
                {featured.length > 0 && !search && (
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <TrendingUp size={13} className="text-blue-400" />
                    </div>
                    <h2 className="text-base font-semibold text-white">Latest Articles</h2>
                  </div>
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
    <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={index} className="card-lift">
      <Link to={`/blog/${article.slug}`}>
        <div className="glass rounded-xl border border-white/8 hover:border-primary/25 transition-all duration-300 overflow-hidden h-full flex flex-col group">
          {article.cover_image_url ? (
            <div className="overflow-hidden h-44 shrink-0">
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ) : (
            <div className="h-44 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent flex items-center justify-center shrink-0">
              <Newspaper size={32} className="text-primary/30" />
            </div>
          )}
          <div className="p-4 space-y-3 flex flex-col flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {article.is_featured && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25">Featured</span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20 capitalize">
                {article.author_role === "admin" ? "HTB Team" : "Mentor"}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-white/35">
                <Clock size={11} /> {article.read_time_minutes} min read
              </span>
            </div>
            <h2 className="font-serif font-bold text-white leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">{article.excerpt}</p>
            )}
            <div className="glow-line opacity-30" />
            <div className="flex items-center gap-2 pt-1 mt-auto">
              {article.author_avatar ? (
                <img src={article.author_avatar} alt={article.author_name || ""} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center">
                  <User size={12} className="text-white/30" />
                </div>
              )}
              <span className="text-xs text-white/35">
                {article.author_name || "HTB Team"} · {formatDate(article.created_at)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default Blog;
