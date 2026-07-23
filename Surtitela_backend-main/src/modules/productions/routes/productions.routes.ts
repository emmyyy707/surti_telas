import { Router } from "express";
import { listProductions, handleCreateProduction, handleDeleteProduction } from "../controller/productions.controller.js";

const router = Router();
router.get("/", listProductions);
router.post("/", handleCreateProduction);
router.delete("/:id", handleDeleteProduction);

export default router;
