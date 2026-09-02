import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import {
  AddItemSchema,
  CancelPurchaseSchema,
  CreatePurchaseSchema,
  PurchaseFiltersSchema,
  UpdatePurchaseSchema,
} from '../validators/purchase.validators';
import { purchaseUseCases } from '../../infrastructure/container/purchaseContainer';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const listPurchases = async (req: Request, res: Response) => {
  const filters = parseDto(PurchaseFiltersSchema, req.query);
  const result = await purchaseUseCases.getPurchases.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getPurchase = async (req: Request, res: Response) => {
  const purchase = await purchaseUseCases.getPurchaseById.execute(req.params.id);
  if (!purchase) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Compra no encontrada' });
  }
  const items = await purchaseUseCases.getPurchaseItems.execute(req.params.id);
  return ok(res, { ...purchase, items });
};

export const createPurchase = async (req: Request, res: Response) => {
  const input = parseDto(CreatePurchaseSchema, req.body);
  const purchase = await purchaseUseCases.createPurchase.execute({ ...input, usuarioId: req.user!.id });
  return created(res, purchase, 'Compra creada');
};

export const updatePurchase = async (req: Request, res: Response) => {
  const changes = parseDto(UpdatePurchaseSchema, req.body);
  const purchase = await purchaseUseCases.updatePurchase.execute(req.params.id, changes);
  return ok(res, purchase, 'Compra actualizada');
};

export const cancelPurchase = async (req: Request, res: Response) => {
  const { motivo } = parseDto(CancelPurchaseSchema, req.body);
  const purchase = await purchaseUseCases.cancelPurchase.execute(req.params.id, motivo);
  return ok(res, purchase, 'Compra anulada');
};

export const deletePurchase = async (req: Request, res: Response) => {
  await purchaseUseCases.deletePurchase.execute(req.params.id);
  return noContent(res);
};

export const listPurchaseItems = async (req: Request, res: Response) => {
  const items = await purchaseUseCases.getPurchaseItems.execute(req.params.id);
  return ok(res, items);
};

export const addPurchaseItem = async (req: Request, res: Response) => {
  const item = parseDto(AddItemSchema, req.body);
  const createdItem = await purchaseUseCases.addPurchaseItem.execute(req.params.id, item);
  return created(res, createdItem, 'Ítem agregado');
};

export const removePurchaseItem = async (req: Request, res: Response) => {
  await purchaseUseCases.removePurchaseItem.execute(req.params.itemId);
  return noContent(res);
};

export const exportPurchasePdf = async (req: Request, res: Response) => {
  const purchase = await purchaseUseCases.getPurchaseById.execute(req.params.id);
  if (!purchase) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Compra no encontrada' });
  }
  const items = await purchaseUseCases.getPurchaseItems.execute(req.params.id);

  const proveedor = await purchaseUseCases.getProveedorNombre.execute(purchase.proveedorId);
  const usuario = await purchaseUseCases.getUsuarioNombre.execute(purchase.usuarioId);

  const sanitize = (value: unknown): string => {
    const str = value == null ? '' : String(value);
    const map: Record<string, string> = {
      '—': '-', '–': '-', '’': "'", '‘': "'", '“': '"', '”': '"', '•': '-', '…': '...', ' ': ' ', '​': '',
    };
    let out = '';
    for (const ch of str) {
      if (map[ch] !== undefined) { out += map[ch]; continue; }
      const cp = ch.codePointAt(0) ?? 0;
      if (cp === 0xfffd) continue;
      if (cp <= 0xff) { out += ch; continue; }
      out += '';
    }
    return out;
  };
  const t = (value: unknown): string => sanitize(value);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText(t('Registro de Compra'), { x: 50, y: 800, size: 20, font: boldFont });
  page.drawText(t(`Número: ${purchase.numero}`), { x: 50, y: 770, size: 12, font });
  page.drawText(t(`Proveedor: ${proveedor}`), { x: 50, y: 750, size: 12, font });
  page.drawText(t(`Usuario: ${usuario}`), { x: 50, y: 730, size: 12, font });
  page.drawText(t(`Fecha: ${new Date(purchase.fecha).toLocaleString()}`), { x: 50, y: 710, size: 12, font });
  page.drawText(t(`Total: $${purchase.total.toFixed(2)}`), { x: 50, y: 690, size: 12, font });
  page.drawText(t(`Estado: ${purchase.estado}`), { x: 50, y: 670, size: 12, font });
  page.drawText(t(`Observaciones: ${purchase.observaciones ?? 'N/A'}`), { x: 50, y: 650, size: 12, font });

  page.drawText(t('Ítems:'), { x: 50, y: 620, size: 14, font: boldFont });
  let y = 600;
  for (const item of items) {
    page.drawText(
      t(`- ${item.nombre} | Cant: ${item.cantidad} | Precio: $${item.precioUnitario.toFixed(2)} | Subtotal: $${item.subtotal.toFixed(2)}`),
      { x: 50, y, size: 11, font },
    );
    y -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="compra-${purchase.numero}.pdf"`);
  res.send(Buffer.from(pdfBytes));
  return;
};
