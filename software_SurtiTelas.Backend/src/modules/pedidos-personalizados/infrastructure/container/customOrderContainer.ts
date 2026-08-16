import { prisma } from '../../../../config/database';
import { PrismaCustomOrderRepository } from '../repositories/PrismaCustomOrderRepository';
import { PrismaQuotationRepository } from '../repositories/PrismaQuotationRepository';
import { ListCustomOrders, GetCustomOrder, CreateCustomOrder, UpdateCustomOrder, SubmitForReview, GenerateQuotation, AcceptQuotation, RejectQuotation, SendQuotation, ConvertToOrder, DeleteCustomOrder } from '../../application/use-cases/CustomOrderUseCases';
import { eventBus } from '../../../../shared/infrastructure/eventBus';

const customOrderRepository = new PrismaCustomOrderRepository(prisma);
const quotationRepository = new PrismaQuotationRepository(prisma);

export const customOrderUseCases = {
  listCustomOrders: new ListCustomOrders(customOrderRepository),
  getCustomOrder: new GetCustomOrder(customOrderRepository),
  createCustomOrder: new CreateCustomOrder(customOrderRepository, prisma, eventBus),
  updateCustomOrder: new UpdateCustomOrder(customOrderRepository, prisma),
  submitForReview: new SubmitForReview(customOrderRepository, prisma, eventBus),
  generateQuotation: new GenerateQuotation(customOrderRepository, quotationRepository, prisma, eventBus),
  acceptQuotation: new AcceptQuotation(customOrderRepository, quotationRepository, prisma, eventBus),
  rejectQuotation: new RejectQuotation(customOrderRepository, quotationRepository, prisma, eventBus),
  sendQuotation: new SendQuotation(customOrderRepository, quotationRepository, eventBus),
  convertToOrder: new ConvertToOrder(customOrderRepository, prisma, quotationRepository, eventBus),
  deleteCustomOrder: new DeleteCustomOrder(customOrderRepository),
};
