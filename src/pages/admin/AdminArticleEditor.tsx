import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye, EyeOff, Clock, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Image as ImageIcon } from "lucide-react";

function calcReadTime(content: string) {
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function wordCount(content: string) {
  const text = content.replace(/<[^>]*>/g, " ");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const AdminArticleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== "new";
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const isAdmin = user?.role === "admin";
  const isMentor = user?.role === "mentor";

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    published: false,
    is_featured: false,
  });

  const readTime = calcReadTime(form.content);
  const words = wordCount(form.content);

  useEffect(() => {
    if (!loading && (!user || (!isAdmin && !isMentor))) navigate("/");
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
        is_featured: existing.is_featured || false,
      });
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form.title.trim()) throw new Error("Title is required");
      if (!form.content.trim() || form.content === "<p></p>") throw new Error("Content is required");
      const payload = isAdmin ? form : { ...form, is_featured: undefined };
      if (isEdit) return api.patch(`/api/articles/${id}`, payload);
      return api.post("/api/articles", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      qc.invalidateQueries({ queryKey: ["mentor-articles"] });
      toast({
        title: isEdit ? "Article saved" : "Article created",
        description: form.published ? "It's now live on the blog." : "Saved as draft.",
      });
      navigate(isAdmin ? "/admin/articles" : "/mentor/articles");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Could not save article.", variant: "destructive" });
    },
  });

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
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => navigate(isAdmin ? "/admin/articles" : "/mentor/articles")}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-lg font-serif font-bold text-foreground">
                {isEdit ? "Edit Article" : "New Article"}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock size={10} /> {words} words · {readTime} min read
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Star size={13} className={form.is_featured ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />
                <Label htmlFor="featured" className="text-sm text-muted-foreground">Featured</Label>
                <Switch
                  id="featured"
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                />
              </div>
            )}
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

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-4">
          {/* Title */}
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Article title…"
            className="text-xl font-serif font-bold h-14 border-0 border-b border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
          />

          {/* Excerpt */}
          <Textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Short summary shown on the blog listing page…"
            rows={2}
            className="resize-none text-sm text-muted-foreground border-0 border-b border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
          />

          {/* Cover image */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={12} /> Cover Image
            </Label>
            <CloudinaryUpload
              value={form.cover_image_url}
              onChange={(url) => setForm({ ...form, cover_image_url: url })}
              folder="htb-articles"
              label=""
            />
          </div>

          <Separator />

          {/* Rich text editor */}
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm(f => ({ ...f, content: html }))}
            placeholder="Start writing your article… Select text to see formatting options, or use the toolbar above."
          />

          <p className="text-xs text-muted-foreground">
            Tip: Select any text for a quick formatting popup. Use the toolbar for headings, lists, links, colours, and more.
          </p>

          {/* Footer actions */}
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline"
              onClick={() => navigate(isAdmin ? "/admin/articles" : "/mentor/articles")}>
              Cancel
            </Button>
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
