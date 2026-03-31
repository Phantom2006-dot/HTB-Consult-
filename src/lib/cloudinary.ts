const CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || "";
const UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || "";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function uploadToCloudinary(
  file: File,
  folder = "htb-academy"
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || "Upload failed");
  }

  return res.json() as Promise<CloudinaryUploadResult>;
}

export async function uploadRawToCloudinary(
  file: File,
  folder = "htb-academy/documents"
): Promise<CloudinaryUploadResult & { formattedSize: string }> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);
  formData.append("resource_type", "raw");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const msg = err?.error?.message || "Upload failed";
    if (msg.includes("preset") || msg.includes("unsigned")) {
      throw new Error(
        "Upload preset needs to allow raw/document uploads. Enable it in your Cloudinary dashboard under Settings → Upload Presets."
      );
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return { ...data, formattedSize: formatBytes(data.bytes || 0) };
}

export function getFileTypeLabel(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    pptx: "PowerPoint",
    ppt: "PowerPoint",
    pdf: "PDF",
    docx: "Word",
    doc: "Word",
    xlsx: "Excel",
    xls: "Excel",
    mp4: "Video",
    mp3: "Audio",
    zip: "ZIP",
  };
  return map[ext] || ext.toUpperCase();
}

export function getFileIcon(fileType: string): string {
  const icons: Record<string, string> = {
    pptx: "🟠",
    ppt: "🟠",
    pdf: "🔴",
    docx: "🔵",
    doc: "🔵",
    xlsx: "🟢",
    xls: "🟢",
    mp4: "🎬",
    mp3: "🎵",
    zip: "📦",
  };
  return icons[fileType.toLowerCase()] || "📄";
}
