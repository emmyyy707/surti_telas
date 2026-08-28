import { prisma } from '../../../../config/database';
import { PrismaCustomOrderRepository } from '../repositories/PrismaCustomOrderRepository';
import { PrismaQuotationRepository } from '../repositories/PrismaQuotationRepository';
import { PrismaCustomOrderHistoryRepository } from '../repositories/PrismaCustomOrderHistoryRepository';
import { PrismaQuotationNegotiationRepository } from '../repositories/PrismaQuotationNegotiationRepository';
import { ListCustomOrders, GetCustomOrder, CreateCustomOrder, UpdateCustomOrder, SubmitForReview, GenerateQuotation, AcceptQuotation, AcceptQuotationWithDecisions, RejectQuotation, SendQuotation, ConvertToOrder, DeleteCustomOrder, ChangeCustomOrderStatus, ConfirmPaymentAndConvertToOrder } from '../../application/use-cases/CustomOrderUseCases';
import { RecordCustomOrderStatusChange, GetCustomOrderHistory } from '../../application/use-cases/CustomOrderHistoryUseCases';
import { GetCustomOrderMetrics } from '../../application/use-cases/GetCustomOrderMetrics';
import { StartNegotiation, RespondToNegotiation, AcceptNegotiationProposal, RejectNegotiationProposal, GetNegotiationHistory } from '../../application/use-cases/QuotationNegotiationUseCases';
import { eventBus } from '../../../../shared/infrastructure/eventBus';

const customOrderRepository = new PrismaCustomOrderRepository(prisma);
const quotationRepository = new PrismaQuotationRepository(prisma);
const customOrderHistoryRepository = new PrismaCustomOrderHistoryRepository(prisma);
const quotationNegotiationRepository = new PrismaQuotationNegotiationRepository(prisma);

export const customOrderUseCases = {
  listCustomOrders: new ListCustomOrders(customOrderRepository),
  getCustomOrder: new GetCustomOrder(customOrderRepository),
  createCustomOrder: new CreateCustomOrder(customOrderRepository, prisma, eventBus),
  updateCustomOrder: new UpdateCustomOrder(customOrderRepository, prisma, eventBus),
  changeCustomOrderStatus: new ChangeCustomOrderStatus(customOrderRepository, customOrderHistoryRepository, eventBus),
  recordCustomOrderStatusChange: new RecordCustomOrderStatusChange(customOrderHistoryRepository),
  getCustomOrderHistory: new GetCustomOrderHistory(customOrderHistoryRepository),
  getCustomOrderMetrics: new GetCustomOrderMetrics(customOrderRepository),
  submitForReview: new SubmitForReview(customOrderRepository, prisma, eventBus),
  generateQuotation: new GenerateQuotation(customOrderRepository, quotationRepository, prisma, eventBus),
  acceptQuotation: new AcceptQuotation(customOrderRepository, quotationRepository, prisma, eventBus),
  acceptQuotationWithDecisions: new AcceptQuotationWithDecisions(customOrderRepository, quotationRepository, prisma, eventBus),
  rejectQuotation: new RejectQuotation(customOrderRepository, quotationRepository, prisma, eventBus),
  sendQuotation: new SendQuotation(customOrderRepository, quotationRepository, eventBus),
  convertToOrder: new ConvertToOrder(customOrderRepository, prisma, quotationRepository, eventBus),
  confirmPaymentAndConvertToOrder: new ConfirmPaymentAndConvertToOrder(customOrderRepository, prisma, quotationRepository, customOrderHistoryRepository, eventBus),
  deleteCustomOrder: new DeleteCustomOrder(customOrderRepository, eventBus),
  startNegotiation: new StartNegotiation(customOrderRepository, quotationRepository, quotationNegotiationRepository, eventBus),
  respondToNegotiation: new RespondToNegotiation(customOrderRepository, quotationRepository, quotationNegotiationRepository, eventBus),
  acceptNegotiationProposal: new AcceptNegotiationProposal(customOrderRepository, quotationRepository, quotationNegotiationRepository, prisma, eventBus),
  rejectNegotiationProposal: new RejectNegotiationProposal(customOrderRepository, quotationRepository, quotationNegotiationRepository, eventBus),
  getNegotiationHistory: new GetNegotiationHistory(quotationNegotiationRepository),
};
