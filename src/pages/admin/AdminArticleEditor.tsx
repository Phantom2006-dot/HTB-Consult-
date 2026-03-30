import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Eye, EyeOff, Clock, Loader2, Star,
  Bold, Italic, Heading1, Heading2, Heading3, List, Link as LinkIcon,
  Image as ImageIcon, Quote, SeparatorHorizontal, AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";
import ReactMarkdown from "react-markdown";

function calcReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const ToolbarButton = ({
  onClick, title, children,
}: { onClick: () => void; title: string; children: React.ReactNode }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
  >
    {children}
  </button>
);

const AdminArticleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== "new";
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

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
  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;

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
      if (!form.content.trim()) throw new Error("Content is required");
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

  const insertAtCursor = useCallback((before: string, after = "", placeholder = "") => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || placeholder;
    const newText = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
    setForm(f => ({ ...f, content: newText }));
    setTimeout(() => {
      el.focus();
      const newPos = start + before.length + selected.length + after.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  }, []);

  const insertLine = useCallback((prefix: string) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = el.value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = el.value.indexOf("\n", start);
    const line = el.value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const newLine = line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line;
    const newText = el.value.slice(0, lineStart) + newLine + (lineEnd === -1 ? "" : el.value.slice(lineEnd));
    setForm(f => ({ ...f, content: newText }));
    setTimeout(() => el.focus(), 0);
  }, []);

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
                <Clock size={10} /> {wordCount} words · {readTime} min read
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
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Article title..."
            className="text-xl font-serif font-bold h-14 border-0 border-b border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
          />

          <Textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Short summary shown on the blog listing page..."
            rows={2}
            className="resize-none text-sm text-muted-foreground border-0 border-b border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
          />

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

          <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "preview")}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <TabsList className="h-8">
                <TabsTrigger value="write" className="text-xs gap-1"><AlignLeft size={12} /> Write</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs gap-1"><Eye size={12} /> Preview</TabsTrigger>
              </TabsList>
              {tab === "write" && (
                <div className="flex items-center gap-0.5 flex-wrap">
                  <ToolbarButton title="Bold" onClick={() => insertAtCursor("**", "**", "bold text")}>
                    <Bold size={14} />
                  </ToolbarButton>
                  <ToolbarButton title="Italic" onClick={() => insertAtCursor("*", "*", "italic text")}>
                    <Italic size={14} />
                  </ToolbarButton>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <ToolbarButton title="Heading 1" onClick={() => insertLine("# ")}>
                    <Heading1 size={14} />
                  </ToolbarButton>
                  <ToolbarButton title="Heading 2" onClick={() => insertLine("## ")}>
                    <Heading2 size={14} />
                  </ToolbarButton>
                  <ToolbarButton title="Heading 3" onClick={() => insertLine("### ")}>
                    <Heading3 size={14} />
                  </ToolbarButton>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <ToolbarButton title="Bullet list" onClick={() => insertLine("- ")}>
                    <List size={14} />
                  </ToolbarButton>
                  <ToolbarButton title="Blockquote" onClick={() => insertLine("> ")}>
                    <Quote size={14} />
                  </ToolbarButton>
                  <ToolbarButton title="Horizontal rule" onClick={() => insertAtCursor("\n\n---\n\n")}>
                    <SeparatorHorizontal size={14} />
                  </ToolbarButton>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <ToolbarButton title="Link" onClick={() => insertAtCursor("[", "](url)", "link text")}>
                    <LinkIcon size={14} />
                  </ToolbarButton>
                  <ToolbarButton title="Image" onClick={() => insertAtCursor("![", "](image-url)", "alt text")}>
                    <ImageIcon size={14} />
                  </ToolbarButton>
                </div>
              )}
            </div>

            <TabsContent value="write" className="mt-0">
              <div className="relative">
                <Textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder={`# Start with a heading\n\nWrite your introduction here...\n\n## Section Title\n\nYour content goes here. Use **bold**, *italic*, and markdown formatting.\n\n- Bullet point one\n- Bullet point two\n\n> Blockquotes for key insights\n\n## Another Section\n\nContinue writing...`}
                  className="min-h-[520px] font-mono text-sm leading-[1.9] resize-none bg-card"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground bg-card/80 backdrop-blur px-2 py-0.5 rounded-full border border-border">
                  {wordCount} words · {readTime} min read
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supports Markdown: **bold**, *italic*, # headings, - lists, {">"} quotes, [links](url)
              </p>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="min-h-[520px] bg-card rounded-md border border-border p-6 prose prose-invert prose-sm max-w-none
                prose-headings:font-serif prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-[1.85]
                prose-strong:text-foreground
                prose-a:text-primary
                prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground
                prose-li:text-muted-foreground
                prose-hr:border-border
                prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded">
                {form.title && (
                  <h1 className="font-serif font-bold text-2xl text-foreground mb-2">{form.title}</h1>
                )}
                {form.excerpt && (
                  <p className="text-muted-foreground italic border-l-2 border-primary/40 pl-4 mb-6">{form.excerpt}</p>
                )}
                {form.content ? (
                  <ReactMarkdown>{form.content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground/40 italic">Nothing to preview yet. Start writing!</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

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
