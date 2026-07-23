import { Router } from "express";
import {
  listDomicilios,
  getDomicilio,
  listRutaDomicilios,
  listHistorialDomicilios,
  getEntregasDomiciliario,
  handleCreateDomicilio,
  handleUpdateDomicilio,
  handleDeleteDomicilio,
} from "../controller/domicilios.controller.js";

const router = Router();
router.get("/", listDomicilios);
router.get("/:id", getDomicilio);
router.get("/ruta", listRutaDomicilios);
router.get("/historial", listHistorialDomicilios);
router.get("/domiciliario/:id/entregas", getEntregasDomiciliario);
router.post("/", handleCreateDomicilio);
router.put("/:id", handleUpdateDomicilio);
router.delete("/:id", handleDeleteDomicilio);

export default router;
