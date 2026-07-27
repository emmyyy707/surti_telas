import multer from 'multer';
import path from 'path';
import { randomUUID } from 'node:crypto';

const uploadsDir = path.resolve(process.cwd(), 'uploads', 'payment-proofs');

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadsDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const paymentProofUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido para comprobante de pago'));
    }
  },
});
