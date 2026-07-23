import { Router } from "express";
import { login, register, logout, refresh, me, requestPasswordReset, resetPassword, verifyEmail, google } from "../controller/auth.controller.js";
import { verifyToken } from "../../../shared/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/google", google);
router.post("/refresh", refresh);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, me);

export default router;
