import { Router } from "express";
import { getProfile, updateProfile } from "../controller/profile.controller.js";
import { verifyToken } from "../../../shared/auth.js";

const router = Router();
router.get("/", verifyToken, getProfile);
router.patch("/", verifyToken, updateProfile);
router.put("/", verifyToken, updateProfile);

export default router;
