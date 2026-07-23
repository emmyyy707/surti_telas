import { Router } from "express";
import {
  listAsesores,
  getAsesor,
  getAsesorClientes,
  getAsesorPedidos,
  getAsesorComisiones,
} from "../controller/asesores.controller.js";

const router = Router();
router.get("/", listAsesores);
router.get("/:id", getAsesor);
router.get("/:id/clientes", getAsesorClientes);
router.get("/:id/pedidos", getAsesorPedidos);
router.get("/:id/comisiones", getAsesorComisiones);

export default router;
