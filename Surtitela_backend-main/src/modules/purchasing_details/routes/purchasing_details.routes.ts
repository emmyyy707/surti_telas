import { Router } from "express";
import { listPurchasingDetails, handleCreatePurchasingDetail, handleDeletePurchasingDetail } from "../controller/purchasing_details.controller.js";

const router = Router();
router.get("/", listPurchasingDetails);
router.post("/", handleCreatePurchasingDetail);
router.delete("/:id", handleDeletePurchasingDetail);

export default router;
