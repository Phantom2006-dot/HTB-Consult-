import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, CheckCircle2, Newspaper, Link2, Twitter, Linkedin, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

function isMarkdown(content: string) {
  return /^#{1,6}\s|^\*\*|^\*[^*]|\[.+\]\(.+\)|^>\s|^- /.test(content.trim());
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  read_time_minutes: number;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  author_role: string;
  author_bio: string | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const btnClass =
    "flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-150";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
        <Share2 size={12} /> Share:
      </span>
      <button onClick={copyLink} className={`${btnClass} ${copied ? "border-green-500 text-green-500" : ""}`} title="Copy link">
        {copied ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        title="Share on X (Twitter)"
      >
        <Twitter size={14} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        title="Share on LinkedIn"
      >
        <Linkedin size={14} />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        title="Share on WhatsApp"
      >
        <MessageCircle size={14} />
      </a>
    </div>
  );
}

const ArticleReader = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [readRecorded, setReadRecorded] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => api.get<Article>(`/api/articles/${slug}`),
    enabled: !!slug,
  });

  const { data: readStatus } = useQuery({
    queryKey: ["article-read", article?.id],
    queryFn: () => api.get<{ read: boolean }>(`/api/articles/${article!.id}/read-status`),
    enabled: !!user && !!article?.id,
  });

  const recordRead = useMutation({
    mutationFn: () => api.post(`/api/articles/${article!.id}/read`, {}),
    onSuccess: () => {
      setReadRecorded(true);
      setShowBadge(true);
      setTimeout(() => setShowBadge(false), 4000);
    },
  });

  useEffect(() => {
    if (!user || !article || readStatus?.read || readRecorded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          recordRead.mutate();
          observer.disconnect();
        }
      },
      { threshold: 0.9 }
    );
    const sentinel = document.getElementById("article-end");
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [user, article, readStatus, readRecorded]);

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (isError || !article) {
    return (
      <SidebarLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Newspaper size={40} className="mx-auto text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground">Article not found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/blog")}>← Back to Blog</Button>
        </div>
      </SidebarLayout>
    );
  }

  const alreadyRead = readStatus?.read || readRecorded;
  const articleUrl = `${window.location.origin}/blog/${article.slug}`;

  return (
    <SidebarLayout>
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-6">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </motion.div>

        {showBadge && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-green-600 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 size={15} /> Article marked as read!
          </motion.div>
        )}

        <motion.article initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          {article.cover_image_url && (
            <div className="rounded-xl overflow-hidden mb-6 h-56 sm:h-72">
              <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Clock size={12} /> {article.read_time_minutes} min read</span>
            <span>·</span>
            <span>{formatDate(article.created_at)}</span>
            {alreadyRead && (
              <span className="flex items-center gap-1 text-green-500 font-medium">
                <CheckCircle2 size={12} /> Read
              </span>
            )}
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground leading-tight mb-4">{article.title}</h1>

          {article.excerpt && (
            <p className="text-base text-muted-foreground italic border-l-2 border-primary/40 pl-4 mb-6 leading-relaxed">{article.excerpt}</p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              {article.author_avatar ? (
                <img src={article.author_avatar} alt={article.author_name || ""} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User size={16} className="text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{article.author_name || "HTB Team"}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {article.author_role === "admin" ? "HTB Consult Team" : "Mentor"}
                </p>
              </div>
            </div>
            <ShareBar title={article.title} url={articleUrl} />
          </div>

          {isMarkdown(article.content) ? (
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:font-serif prose-headings:text-foreground
              prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-xl prose-h2:mt-7 prose-h2:mb-3
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-muted-foreground prose-p:leading-[1.85] prose-p:my-4
              prose-strong:text-foreground prose-strong:font-semibold
              prose-em:text-muted-foreground
              prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:opacity-80
              prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground prose-blockquote:italic
              prose-li:text-muted-foreground prose-li:leading-relaxed
              prose-ul:my-4 prose-ol:my-4
              prose-hr:border-border prose-hr:my-8
              prose-img:rounded-lg prose-img:shadow-md
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-muted prose-pre:rounded-lg prose-pre:border prose-pre:border-border">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          ) : (
            <div
              className="article-html-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}

          <div id="article-end" className="h-4 mt-8" />

          {/* Bottom share bar */}
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm font-medium text-foreground">Found this helpful? Share it!</p>
            <ShareBar title={article.title} url={articleUrl} />
          </div>

          {article.author_bio && (
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-3 mb-3">
                {article.author_avatar ? (
                  <img src={article.author_avatar} alt={article.author_name || ""} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">About {article.author_name || "the author"}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {article.author_role === "admin" ? "HTB Consult Team" : "Mentor"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{article.author_bio}</p>
            </div>
          )}
        </motion.article>
      </div>
    </SidebarLayout>
  );
};

export default ArticleReader;
