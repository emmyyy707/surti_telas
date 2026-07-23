import { Router } from "express";
import {
  reportVentas,
  reportInventario,
  reportComisiones,
  reportClientes,
  reportProductosTop,
  reportAsesores,
  reportVentasMensuales,
} from "../controller/reportes.controller.js";

const router = Router();
router.get("/ventas", reportVentas);
router.get("/inventario", reportInventario);
router.get("/comisiones", reportComisiones);
router.get("/clientes", reportClientes);
router.get("/productos-top", reportProductosTop);
router.get("/asesores", reportAsesores);
router.get("/ventas-mensuales", reportVentasMensuales);

export default router;
