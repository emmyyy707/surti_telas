import { Router } from "express";
import { listSales, handleCreateSale, handleDeleteSale } from "../controller/sales.controller.js";

const router = Router();
router.get("/", listSales);
router.post("/", handleCreateSale);
router.delete("/:id", handleDeleteSale);

export default router;
