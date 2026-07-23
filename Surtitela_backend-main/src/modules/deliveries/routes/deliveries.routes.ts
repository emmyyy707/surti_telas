import { Router } from "express";
import { listDeliveries, handleCreateDelivery, handleDeleteDelivery } from "../controller/deliveries.controller.js";

const router = Router();
router.get("/", listDeliveries);
router.post("/", handleCreateDelivery);
router.delete("/:id", handleDeleteDelivery);

export default router;
