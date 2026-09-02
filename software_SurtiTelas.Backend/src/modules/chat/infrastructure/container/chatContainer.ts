import { prisma } from '../../../../config/database';
import { PrismaChatRepository } from '../repositories/PrismaChatRepository';
import { ListConversations, GetConversation, ListMessages, CreateMessage, LinkOrderToConversation, GetConversationMetrics } from '../../application/use-cases/ChatUseCases';

const chatRepository = new PrismaChatRepository(prisma);

export const chatUseCases = {
  listConversations: new ListConversations(chatRepository),
  getConversation: new GetConversation(chatRepository),
  listMessages: new ListMessages(chatRepository),
  createMessage: new CreateMessage(chatRepository),
  linkOrder: new LinkOrderToConversation(chatRepository),
  getMetrics: new GetConversationMetrics(chatRepository),
};
