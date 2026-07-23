import { Router } from "express";
import { listReturnDetails, handleCreateReturnDetail, handleDeleteReturnDetail } from "../controller/returns_details.controller.js";

const router = Router();
router.get("/", listReturnDetails);
router.post("/", handleCreateReturnDetail);
router.delete("/:id", handleDeleteReturnDetail);

export default router;
