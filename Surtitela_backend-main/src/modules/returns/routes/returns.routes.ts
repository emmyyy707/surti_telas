import { Router } from "express";
import { listReturns, handleCreateReturn, handleDeleteReturn } from "../controller/returns.controller.js";

const router = Router();
router.get("/", listReturns);
router.post("/", handleCreateReturn);
router.delete("/:id", handleDeleteReturn);

export default router;
