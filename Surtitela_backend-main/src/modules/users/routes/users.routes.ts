import { Router } from "express";
import { verifyToken, authorizeRoles } from "../../../shared/auth.js";
import { listUsers, handleCreateUser, handleGetUserById, handleUpdateUser, handleDeleteUser, handleToggleUser, handleResetUsers, handleUpdateUserRole } from "../controller/users.controller.js";

const router = Router();
router.use(verifyToken, authorizeRoles("admin"));

router.get("/", listUsers);
router.get("/:id", handleGetUserById);
router.post("/", handleCreateUser);
router.patch("/:id", handleUpdateUser);
router.patch("/:id/toggle", handleToggleUser);
router.patch("/:id/role", handleUpdateUserRole);
router.delete("/:id", handleDeleteUser);
router.post("/reset", handleResetUsers);

export default router;
