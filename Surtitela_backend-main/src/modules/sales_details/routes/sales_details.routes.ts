import { Router } from "express";
import { listSaleDetails, handleCreateSaleDetail, handleDeleteSaleDetail } from "../controller/sales_details.controller.js";

const router = Router();
router.get("/", listSaleDetails);
router.post("/", handleCreateSaleDetail);
router.delete("/:id", handleDeleteSaleDetail);

export default router;
