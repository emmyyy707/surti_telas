import { Router } from "express";
import multer from "multer";
import { upload, remove, replace, list } from "../controller/uploads.controller.js";
import { verifyToken } from "../../../shared/auth.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadMiddleware = multer({ storage });

router.post("/upload", verifyToken, uploadMiddleware.single("file"), upload);
router.get("/", verifyToken, list);
router.delete("/:id", verifyToken, remove);
router.put("/:id/replace", verifyToken, uploadMiddleware.single("file"), replace);

export default router;