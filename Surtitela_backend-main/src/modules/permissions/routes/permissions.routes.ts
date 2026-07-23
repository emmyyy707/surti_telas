import { Router } from "express";
import { listPermissions, handleCreatePermission, handleDeletePermission } from "../controller/permissions.controller.js";

const router = Router();
router.get("/", listPermissions);
router.post("/", handleCreatePermission);
router.delete("/:id", handleDeletePermission);

export default router;
