import { Router } from "express";
import { listPurchases, handleCreatePurchase, handleDeletePurchase } from "../controller/purchases.controller.js";

const router = Router();
router.get("/", listPurchases);
router.post("/", handleCreatePurchase);
router.delete("/:id", handleDeletePurchase);

export default router;
