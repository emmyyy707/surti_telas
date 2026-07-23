import { Router } from "express";
import { listOrderDetails, handleCreateOrderDetail, handleDeleteOrderDetail } from "../controller/orders_details.controller.js";

const router = Router();
router.get("/", listOrderDetails);
router.post("/", handleCreateOrderDetail);
router.delete("/:id", handleDeleteOrderDetail);

export default router;
