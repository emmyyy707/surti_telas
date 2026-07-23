import { Router } from "express";
import { listSupplies, handleCreateSupply, handleDeleteSupply } from "../controller/supplies.controller.js";

const router = Router();
router.get("/", listSupplies);
router.post("/", handleCreateSupply);
router.delete("/:id", handleDeleteSupply);

export default router;
