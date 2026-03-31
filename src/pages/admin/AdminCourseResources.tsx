import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Upload, Trash2, FileText, ArrowLeft, Loader2,
  Presentation, FileSpreadsheet, FileType, File, Download, Pencil, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { uploadRawToCloudinary, getFileTypeLabel, getFileIcon } from "@/lib/cloudinary";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";

interface Resource {
  id: string;
  course_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  pptx: Presentation,
  ppt: Presentation,
  pdf: FileType,
  docx: FileText,
  doc: FileText,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
};

function getIconComponent(fileType: string) {
  return FILE_ICONS[fileType?.toLowerCase()] || File;
}

const ACCEPTED_TYPES = [
  ".ppt", ".pptx",
  ".pdf",
  ".doc", ".docx",
  ".xls", ".xlsx",
  ".mp4", ".zip",
].join(",");

const AdminCourseResources = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [pendingTitle, setPendingTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate("/");
  }, [user, loading, navigate]);

  const { data: course } = useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => api.get<{ id: string; title: string }>(`/api/courses/${courseId}`),
    enabled: !!courseId,
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ["course-resources", courseId],
    queryFn: () => api.get<Resource[]>(`/api/resources/course/${courseId}`),
    enabled: !!courseId,
  });

  const deleteResource = useMutation({
    mutationFn: (id: string) => api.delete(`/api/resources/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-resources", courseId] });
      toast({ title: "Deleted", description: "Resource removed." });
    },
    onError: () => toast({ title: "Error", description: "Could not delete resource.", variant: "destructive" }),
  });

  const renameResource = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.patch(`/api/resources/${id}`, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-resources", courseId] });
      setEditingId(null);
    },
    onError: () => toast({ title: "Error", description: "Could not rename resource.", variant: "destructive" }),
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "file";
    const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
    const title = pendingTitle.trim() || defaultTitle;

    setUploading(true);
    setUploadProgress(`Uploading ${file.name}…`);

    try {
      const result = await uploadRawToCloudinary(file, "htb-academy/documents");

      await api.post(`/api/resources/course/${courseId}`, {
        title,
        file_url: result.secure_url,
        file_type: ext,
        file_size: result.formattedSize,
      });

      qc.invalidateQueries({ queryKey: ["course-resources", courseId] });
      setPendingTitle("");
      toast({ title: "Uploaded!", description: `"${title}" added to this course.` });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Link to="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Courses
          </Link>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground">
            Course Resources
          </h1>
          {course && (
            <p className="text-muted-foreground text-sm mt-1">{course.title}</p>
          )}
        </motion.div>

        {/* Upload Zone */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Upload a File</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    File title <span className="text-muted-foreground/60">(optional — uses filename if blank)</span>
                  </label>
                  <Input
                    placeholder="e.g. Week 1 — Introduction Slides"
                    value={pendingTitle}
                    onChange={(e) => setPendingTitle(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer
                    ${uploading
                      ? "border-primary/40 bg-primary/5 cursor-wait"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={28} className="text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">{uploadProgress}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Upload size={22} className="text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Click to upload a file</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PowerPoint, PDF, Word, Excel, MP4, ZIP
                        </p>
                      </div>
                    </>
                  )}
                </button>

                <div className="flex flex-wrap gap-1.5">
                  {["PPTX", "PPT", "PDF", "DOCX", "XLSX", "MP4", "ZIP"].map((ext) => (
                    <Badge key={ext} variant="outline" className="text-[10px] border-muted-foreground/20 text-muted-foreground">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources List */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Uploaded Resources {resources && resources.length > 0 && `(${resources.length})`}
          </h2>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !resources || resources.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-10 text-center">
                <Presentation size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
              </CardContent>
            </Card>
          ) : (
            resources.map((resource, i) => {
              const IconComp = getIconComponent(resource.file_type);
              const isEditing = editingId === resource.id;

              return (
                <motion.div key={resource.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                        <IconComp size={20} className="text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-7 text-sm py-0"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") renameResource.mutate({ id: resource.id, title: editTitle });
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-green-500 hover:text-green-400 shrink-0"
                              onClick={() => renameResource.mutate({ id: resource.id, title: editTitle })}
                            >
                              <Check size={13} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                              onClick={() => setEditingId(null)}
                            >
                              <X size={13} />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-foreground truncate">{resource.title}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] border-primary/20 text-primary uppercase px-1.5 py-0">
                            {resource.file_type}
                          </Badge>
                          {resource.file_size && (
                            <span className="text-[11px] text-muted-foreground">{resource.file_size}</span>
                          )}
                          {resource.uploaded_by_name && (
                            <span className="text-[11px] text-muted-foreground">by {resource.uploaded_by_name}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" title="Download">
                            <Download size={14} />
                          </Button>
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:text-primary"
                          title="Rename"
                          onClick={() => {
                            setEditingId(resource.id);
                            setEditTitle(resource.title);
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:text-destructive"
                          title="Delete"
                          onClick={() => {
                            if (confirm("Delete this resource?")) deleteResource.mutate(resource.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default AdminCourseResources;
