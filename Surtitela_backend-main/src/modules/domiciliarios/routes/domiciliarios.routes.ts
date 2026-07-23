import { Router } from "express";
import {
  listDomiciliarios,
  getDomiciliario,
  handleCreateDomiciliario,
  handleUpdateDomiciliario,
  handleDeleteDomiciliario,
} from "../controller/domiciliarios.controller.js";

const router = Router();
router.get("/", listDomiciliarios);
router.get("/:id", getDomiciliario);
router.post("/", handleCreateDomiciliario);
router.put("/:id", handleUpdateDomiciliario);
router.delete("/:id", handleDeleteDomiciliario);

export default router;
