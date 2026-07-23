import { Router } from "express";
import multer from "multer";
import { listPayments, handleCreatePayment, handleUploadPaymentReceipt, handleDeletePayment } from "../controller/payments.controller.js";

const upload = multer({ dest: "uploads/" });
const router = Router();
router.get("/", listPayments);
router.post("/", handleCreatePayment);
router.post("/comprobante", upload.single("comprobante"), handleUploadPaymentReceipt);
router.delete("/:id", handleDeletePayment);

export default router;
