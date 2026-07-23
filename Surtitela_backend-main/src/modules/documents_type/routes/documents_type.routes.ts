import { Router } from "express";
import { listDocumentTypes, handleCreateDocumentType, handleDeleteDocumentType } from "../controller/documents_type.controller.js";

const router = Router();

router.get("/", listDocumentTypes);
router.post("/", handleCreateDocumentType);
router.delete("/:id", handleDeleteDocumentType);

export default router;
