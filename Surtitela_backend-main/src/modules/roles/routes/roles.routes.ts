import { Router } from "express";
import { verifyToken, authorizeRoles } from "../../../shared/auth.js";
import { listRoles, handleCreateRole, handleDeleteRole } from "../controller/roles.controller.js";

const router = Router();
router.use(verifyToken, authorizeRoles("admin"));
router.get("/", listRoles);
router.post("/", handleCreateRole);
router.delete("/:id", handleDeleteRole);

export default router;
