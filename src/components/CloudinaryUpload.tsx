import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export function CloudinaryUpload({
  value,
  onChange,
  folder = "htb-academy",
  label = "Image",
  className = "",
}: CloudinaryUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, folder);
      onChange(result.secure_url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground block">{label}</label>

      {value && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          data-testid="input-file-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          data-testid="button-upload-image"
        >
          {uploading ? (
            <><Loader2 size={14} className="animate-spin" /> Uploading…</>
          ) : (
            <><Upload size={14} /> Upload</>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">or</span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL"
          className="flex-1 h-9 text-xs"
          data-testid="input-image-url"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
