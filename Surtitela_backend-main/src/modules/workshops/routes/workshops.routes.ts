import { Router } from "express";
import { listWorkshops, handleCreateWorkshop, handleDeleteWorkshop } from "../controller/workshops.controller.js";

const router = Router();
router.get("/", listWorkshops);
router.post("/", handleCreateWorkshop);
router.delete("/:id", handleDeleteWorkshop);

export default router;
