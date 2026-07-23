import { Router } from "express";
import { handleCheckout, getPaymentMethods } from "../controller/checkout.controller.js";
import { verifyToken } from "../../../shared/auth.js";

const router = Router();
router.post("/confirm", verifyToken, handleCheckout);
router.get("/payment-methods", verifyToken, getPaymentMethods);

export default router;
