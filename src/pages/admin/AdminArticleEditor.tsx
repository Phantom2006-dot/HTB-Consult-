import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye, EyeOff, Clock, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";

function calcReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const AdminArticleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== "new";
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    published: false,
  });

  const readTime = calcReadTime(form.content);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "mentor"))) navigate("/");
  }, [user, loading, navigate]);

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["article-edit", id],
    queryFn: () => api.get<any>(`/api/articles/admin/${id}`),
    enabled: !!isEdit && !!user,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || "",
        excerpt: existing.excerpt || "",
        content: existing.content || "",
        cover_image_url: existing.cover_image_url || "",
        published: existing.published || false,
      });
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form.title.trim()) throw new Error("Title is required");
      if (!form.content.trim()) throw new Error("Content is required");
      if (isEdit) {
        return api.patch(`/api/articles/${id}`, form);
      } else {
        return api.post("/api/articles", form);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      toast({ title: isEdit ? "Article saved" : "Article created", description: form.published ? "It's now live on the blog." : "Saved as draft." });
      navigate("/admin/articles");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Could not save article.", variant: "destructive" });
    },
  });

  const autoResize = () => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  };

  if (loadingExisting) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/admin/articles")}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-lg font-serif font-bold text-foreground">
                {isEdit ? "Edit Article" : "New Article"}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock size={10} /> Estimated read time: {readTime} min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {form.published ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-muted-foreground" />}
              <Label htmlFor="published" className="text-sm text-muted-foreground">
                {form.published ? "Published" : "Draft"}
              </Label>
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
            </div>
            <Button
              className="bg-gradient-gold hover:opacity-90 gap-1.5"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? "Save" : "Publish"}
            </Button>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-5">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-foreground mb-1 block">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Your article title..."
              className="text-base font-semibold h-12"
            />
          </div>

          <div>
            <Label htmlFor="excerpt" className="text-sm font-medium text-foreground mb-1 block">
              Excerpt <span className="text-muted-foreground font-normal">(shown on blog listing)</span>
            </Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="A short summary of your article..."
              rows={2}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-1 flex items-center gap-1.5 block">
              <ImageIcon size={13} className="text-primary" /> Cover Image
            </Label>
            <CloudinaryUpload
              value={form.cover_image_url}
              onChange={(url) => setForm({ ...form, cover_image_url: url })}
              folder="htb-articles"
              label=""
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium text-foreground mb-2 block">
              Content *
              <span className="text-muted-foreground font-normal ml-2 text-xs">
                Supports headings (# ## ###), bullet lists (- item), and paragraphs
              </span>
            </Label>
            <div className="relative">
              <Textarea
                id="content"
                ref={contentRef}
                value={form.content}
                onChange={(e) => {
                  setForm({ ...form, content: e.target.value });
                  autoResize();
                }}
                onInput={autoResize}
                placeholder={`# Article Heading

Write your introduction here...

## Section Title

Your content goes here. Each blank line creates a new paragraph.

- Bullet point one
- Bullet point two

## Another Section

Continue writing your article...`}
                className="min-h-[480px] font-mono text-sm leading-relaxed resize-none overflow-hidden"
                style={{ height: "480px" }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-card px-2 py-0.5 rounded">
                {form.content.trim().split(/\s+/).filter(Boolean).length} words · {readTime} min read
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/articles")}>Cancel</Button>
            <Button
              className="bg-gradient-gold hover:opacity-90 gap-1.5"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? "Save Changes" : "Create Article"}
            </Button>
          </div>
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default AdminArticleEditor;
