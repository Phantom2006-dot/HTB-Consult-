export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export async function uploadToCloudinary(
  file: File,
  folder = "htb-academy"
): Promise<CloudinaryUploadResult> {
  const token = localStorage.getItem("htb_token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload/image", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null) as any;
    throw new Error(err?.error || "Upload failed");
  }

  return res.json() as Promise<CloudinaryUploadResult>;
}

export async function uploadRawToCloudinary(
  file: File,
  folder = "htb-academy/documents"
): Promise<CloudinaryUploadResult & { formattedSize: string }> {
  const token = localStorage.getItem("htb_token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload/raw", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null) as any;
    throw new Error(err?.error || "Upload failed");
  }

  return res.json() as Promise<CloudinaryUploadResult & { formattedSize: string }>;
}

export function getFileTypeLabel(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    pptx: "PowerPoint", ppt: "PowerPoint",
    pdf: "PDF",
    docx: "Word", doc: "Word",
    xlsx: "Excel", xls: "Excel",
    mp4: "Video", mp3: "Audio",
    zip: "ZIP",
  };
  return map[ext] || ext.toUpperCase();
}

export function getFileIcon(fileType: string): string {
  const icons: Record<string, string> = {
    pptx: "🟠", ppt: "🟠",
    pdf: "🔴",
    docx: "🔵", doc: "🔵",
    xlsx: "🟢", xls: "🟢",
    mp4: "🎬", mp3: "🎵",
    zip: "📦",
  };
  return icons[fileType.toLowerCase()] || "📄";
}
