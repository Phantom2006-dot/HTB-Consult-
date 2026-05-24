import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

async function cloudinaryUpload(buffer: Buffer, originalname: string, folder: string, resourceType: "image" | "raw" | "auto" = "auto") {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured on the server.");
  }

  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append("file", blob, originalname);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const res = await fetch(url, { method: "POST", body: formData });

  if (!res.ok) {
    const err = await res.json().catch(() => null) as any;
    throw new Error(err?.error?.message || "Cloudinary upload failed");
  }

  return res.json();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

router.post("/image", requireAuth, requireAdmin, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const folder = (req.body.folder as string) || "htb-academy";
    const data = await cloudinaryUpload(req.file.buffer, req.file.originalname, folder, "image") as any;
    return res.json({
      secure_url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/raw", requireAuth, requireAdmin, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const folder = (req.body.folder as string) || "htb-academy/documents";
    const data = await cloudinaryUpload(req.file.buffer, req.file.originalname, folder, "raw") as any;
    return res.json({
      secure_url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format,
      bytes: data.bytes,
      formattedSize: formatBytes(data.bytes || 0),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
