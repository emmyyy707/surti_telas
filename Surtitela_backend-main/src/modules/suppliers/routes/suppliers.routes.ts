import { Router } from "express";
import { listSuppliers, handleCreateSupplier, handleDeleteSupplier } from "../controller/suppliers.controller.js";

const router = Router();
router.get("/", listSuppliers);
router.post("/", handleCreateSupplier);
router.delete("/:id", handleDeleteSupplier);

export default router;
