import { Request, Response } from "express";
import { respuestaExitosa, respuestaError } from "../../../shared/http.js";
import {
  getReportVentas,
  getReportInventario,
  getReportComisiones,
  getReportClientes,
  getReportProductosTop,
  getReportAsesores,
  getReportVentasMensuales,
} from "../service/reportes.service.js";

export async function reportVentas(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getReportVentas();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function reportInventario(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getReportInventario();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function reportComisiones(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getReportComisiones();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function reportClientes(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getReportClientes();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function reportProductosTop(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getReportProductosTop();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function reportAsesores(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getReportAsesores();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function reportVentasMensuales(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getReportVentasMensuales();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
