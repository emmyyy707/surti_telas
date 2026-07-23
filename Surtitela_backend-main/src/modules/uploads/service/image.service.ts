import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No se proporcionó ningún archivo" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { valid: false, error: "Tipo de archivo no permitido. Solo se aceptan imágenes (jpg, jpeg, png, webp, svg)" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "El archivo excede el límite de 5MB" };
  }

  return { valid: true };
}

export async function uploadImage(file: Express.Multer.File, entityType?: string, entityId?: number): Promise<{ url: string; publicId: string; size: number; mimeType: string; width?: number; height?: number }> {
  const tempPath = file.path;
  const fileName = `${Date.now()}-${file.originalname}`;

  const result = await cloudinary.uploader.upload(tempPath, {
    public_id: fileName,
    resource_type: "image",
    quality: "auto:good",
    fetch_format: "auto",
  });

  fs.unlinkSync(tempPath);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    size: result.bytes,
    mimeType: result.mimetype,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

export async function replaceImage(oldPublicId: string, file: Express.Multer.File): Promise<{ url: string; publicId: string; size: number; mimeType: string; width?: number; height?: number }> {
  await deleteImage(oldPublicId);
  return uploadImage(file);
}