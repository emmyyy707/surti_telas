import { Order } from '../../../orders/domain/entities/Order';
import { Sale } from '../../../sales-orders/domain/entities/Sale';
import { Receipt } from '../../../receipts/domain/entities/Receipt';
import { ReceiptPdfGenerator } from './ReceiptPdfGenerator';
import { EmailService } from './EmailService';
import { CompanyConfig } from '../../../company/domain/entities/CompanyConfig';
import { prisma } from '../../../../config/database';

export class ReceiptSender {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  async send(order: Order, sale: Sale, receipt: Receipt, company: CompanyConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const { html } = await ReceiptPdfGenerator.generate(order, sale, receipt, company);
      const { url } = await ReceiptPdfGenerator.saveHtml(html, receipt.numero);

      const cliente = await prisma.customer.findFirst({
        where: { id: order.clienteId, deletedAt: null },
        select: { nombre: true, telefono: true },
      });

      if (cliente?.email) {
        await this.emailService.sendReceipt(
          { email: cliente.email, nombre: cliente.nombre },
          `${process.env.FRONTEND_URL || 'http://localhost:5173'}${url}`,
          order.numero,
          Number(receipt.total)
        );
      }

      await prisma.receipt.update({
        where: { id: receipt.id },
        data: {
          url,
          estado: 'ENVIADO',
          estadoEnvio: 'ENVIADO',
          fechaEnvio: new Date(),
          intentosEnvio: { increment: 1 },
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { estado: 'RECIBO_ENVIADO' },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar recibo';
      await prisma.receipt.update({
        where: { id: receipt.id },
        data: {
          estadoEnvio: 'FALLIDO',
          intentosEnvio: { increment: 1 },
          ultimoErrorEnvio: errorMessage,
        },
      });
      return { success: false, error: errorMessage };
    }
  }
}
