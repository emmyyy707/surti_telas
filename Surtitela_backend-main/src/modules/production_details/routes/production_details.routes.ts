import { Router } from "express";
import { listProductionDetails, handleCreateProductionDetail, handleDeleteProductionDetail } from "../controller/production_details.controller.js";

const router = Router();
router.get("/", listProductionDetails);
router.post("/", handleCreateProductionDetail);
router.delete("/:id", handleDeleteProductionDetail);

export default router;
