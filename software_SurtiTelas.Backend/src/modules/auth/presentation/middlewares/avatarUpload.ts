import multer from 'multer';
import path from 'path';
import { randomUUID } from 'node:crypto';
import fs from 'fs';

const uploadsDir = path.resolve(process.cwd(), 'uploads', 'profile');

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG, WebP y GIF.'));
    }
  },
});
