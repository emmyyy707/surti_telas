import fs from 'fs';
import path from 'path';
import { Order } from '../../../orders/domain/entities/Order';
import { Sale } from '../../../sales-orders/domain/entities/Sale';
import { Receipt } from '../../../receipts/domain/entities/Receipt';
import { CompanyConfig } from '../../../company/domain/entities/CompanyConfig';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'receipts');

export interface GeneratedReceipt {
  html: string;
  filePath?: string;
  url?: string;
}

export class ReceiptPdfGenerator {
  private static ensureDir() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  static async generate(order: Order, sale: Sale, receipt: Receipt, company: CompanyConfig): Promise<GeneratedReceipt> {
    const html = this.buildHtml(order, sale, receipt, company);
    return { html };
  }

  static async saveHtml(html: string, receiptNumero: string): Promise<{ filePath: string; url: string }> {
    this.ensureDir();
    const filename = `${receiptNumero}.html`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, html, 'utf-8');
    const url = `/uploads/receipts/${filename}`;
    return { filePath, url };
  }

  private static buildHtml(order: Order, sale: Sale, receipt: Receipt, company: CompanyConfig): string {
    const itemsHtml = (order.itemsList ?? [])
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${this.escapeHtml(item.nombre)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.cantidad}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.precio.toLocaleString('es-CO')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.precio * item.cantidad).toLocaleString('es-CO')}</td>
      </tr>
    `
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Recibo ${receipt.numero}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1f2937; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
    .company h1 { margin: 0; color: #2563eb; }
    .company p { margin: 4px 0; color: #6b7280; }
    .receipt-info { text-align: right; }
    .receipt-info h2 { margin: 0; color: #2563eb; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-box { background: #f9fafb; padding: 16px; border-radius: 8px; }
    .info-box h3 { margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #2563eb; color: white; padding: 10px 8px; text-align: left; font-size: 14px; }
    th:last-child, th:nth-child(3), th:nth-child(4) { text-align: right; }
    th:nth-child(2) { text-align: center; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-table { width: 300px; border-collapse: collapse; }
    .totals-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .totals-table td:last-child { text-align: right; font-weight: bold; }
    .totals-table tr.total td { font-size: 18px; color: #2563eb; border-top: 2px solid #2563eb; border-bottom: none; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h1>${this.escapeHtml(company.nombre)}</h1>
      <p>NIT: ${this.escapeHtml(company.nit || '')}</p>
      <p>${this.escapeHtml(company.direccion || '')} - ${this.escapeHtml(company.ciudad || '')}</p>
      <p>Tel: ${this.escapeHtml(company.telefono || '')} | Email: ${this.escapeHtml(company.email || '')}</p>
    </div>
    <div class="receipt-info">
      <h2>RECIBO</h2>
      <p><strong>No. ${this.escapeHtml(receipt.numero)}</strong></p>
      <p>Fecha: ${new Date(receipt.emitidoAt).toLocaleString('es-CO')}</p>
      <p>Estado: ${this.escapeHtml(receipt.estado)}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Cliente</h3>
      <p><strong>${this.escapeHtml(order.cliente)}</strong></p>
      <p>Pedido: ${this.escapeHtml(order.numero)}</p>
    </div>
    <div class="info-box">
      <h3>Venta</h3>
      <p><strong>Asesor:</strong> ${this.escapeHtml(order.asesor)}</p>
      <p><strong>Medio de pago:</strong> ${this.escapeHtml(order.medioPago || 'N/A')}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th style="text-align: center;">Cant.</th>
        <th style="text-align: right;">Precio unit.</th>
        <th style="text-align: right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <table class="totals-table">
      <tr><td>Subtotal</td><td>$${sale.subtotal.toLocaleString('es-CO')}</td></tr>
      <tr><td>Impuestos</td><td>$${sale.impuestos.toLocaleString('es-CO')}</td></tr>
      <tr><td>Descuentos</td><td>-$${sale.descuentos.toLocaleString('es-CO')}</td></tr>
      <tr class="total"><td>Total</td><td>$${sale.total.toLocaleString('es-CO')}</td></tr>
    </table>
  </div>

  <div class="footer">
    <p>Este recibo fue generado automáticamente por ${this.escapeHtml(company.nombre)}</p>
    <p>Fecha de generación: ${new Date().toLocaleString('es-CO')}</p>
  </div>
</body>
</html>`;
  }

  private static escapeHtml(text: string): string {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
