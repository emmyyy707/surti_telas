import { Router } from "express";
import { listOrders, getOrder, handleCreateOrder, handleUpdateOrder, handleUpdateOrderStatus, handleDeleteOrder } from "../controller/orders.controller.js";
import { verifyToken } from "../../../shared/auth.js";

const router = Router();
router.use(verifyToken);

router.get("/", listOrders);
router.get("/:id", getOrder);
router.post("/", handleCreateOrder);
router.patch("/:id", handleUpdateOrder);
router.patch("/:id/status", handleUpdateOrderStatus);
router.delete("/:id", handleDeleteOrder);

export default router;