import { prisma } from '../../../../config/database';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { PrismaOrderRepository } from '../../../orders/infrastructure/repositories/PrismaOrderRepository';
import { PrismaSaleRepository } from '../repositories/PrismaSaleRepository';
import { PrismaOrderHistoryRepository } from '../repositories/PrismaOrderHistoryRepository';
import { PrismaReceiptRepository } from '../repositories/PrismaReceiptRepository';
import { UploadPaymentProof } from '../../application/use-cases/UploadPaymentProof';
import { StartValidation } from '../../application/use-cases/StartValidation';
import { AcceptOrder } from '../../application/use-cases/AcceptOrder';
import { RejectOrder } from '../../application/use-cases/RejectOrder';
import { RetryReceiptDelivery } from '../../application/use-cases/RetryReceiptDelivery';
import { GetSalesReport } from '../../application/use-cases/GetSalesReport';
import { GetSales } from '../../application/use-cases/GetSales';
import { GetSaleById } from '../../application/use-cases/GetSaleById';
import { CreateSale } from '../../application/use-cases/CreateSale';
import { CancelSale } from '../../application/use-cases/CancelSale';
import { AddSaleItem } from '../../application/use-cases/AddSaleItem';
import { RemoveSaleItem } from '../../application/use-cases/RemoveSaleItem';
import { GenerateSalePdf } from '../../application/use-cases/GenerateSalePdf';
import { SaleCreationService } from '../../application/services/SaleCreationService';
import { EmailService } from '../../infrastructure/services/EmailService';
import { ReceiptSender } from '../../infrastructure/services/ReceiptSender';

const orderRepository = new PrismaOrderRepository(prisma);
const saleRepository = new PrismaSaleRepository(prisma);
const historyRepository = new PrismaOrderHistoryRepository(prisma);
const receiptRepository = new PrismaReceiptRepository(prisma);
const saleCreationService = new SaleCreationService(saleRepository, receiptRepository);

const emailConfig = {
  host: process.env.SMTP_HOST || 'localhost',
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  fromName: process.env.SMTP_FROM_NAME || 'SurtiTelas',
  fromEmail: process.env.SMTP_FROM_EMAIL || 'no-reply@surtitelas.com',
};

const emailService = new EmailService(emailConfig);
const receiptSender = new ReceiptSender(emailService);

export const salesOrderUseCases = {
  uploadPaymentProof: new UploadPaymentProof(orderRepository, historyRepository, eventBus),
  startValidation: new StartValidation(orderRepository, historyRepository, eventBus),
  acceptOrder: new AcceptOrder(orderRepository, historyRepository, saleRepository, receiptRepository, eventBus, saleCreationService),
  rejectOrder: new RejectOrder(orderRepository, historyRepository, eventBus),
  retryReceiptDelivery: new RetryReceiptDelivery(orderRepository, historyRepository, receiptRepository, eventBus),
  getSalesReport: new GetSalesReport(saleRepository),
  getOrderById: orderRepository.getById.bind(orderRepository),
  getSales: new GetSales(prisma),
  getSaleById: new GetSaleById(prisma, saleRepository),
  createSale: new CreateSale(orderRepository, saleRepository, receiptRepository, historyRepository, eventBus, saleCreationService),
  cancelSale: new CancelSale(saleRepository),
  addSaleItem: new AddSaleItem(saleRepository),
  removeSaleItem: new RemoveSaleItem(saleRepository),
  generateSalePdf: new GenerateSalePdf(),
};

export { eventBus, receiptSender };
