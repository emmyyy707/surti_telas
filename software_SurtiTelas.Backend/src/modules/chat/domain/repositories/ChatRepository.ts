import type { Conversation, Message, ConversationMetrics } from '../entities/Chat';

export interface ChatRepository {
  listConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string, userId: string): Promise<Conversation | null>;
  listMessages(conversationId: string, userId: string): Promise<Message[]>;
  createMessage(input: {
    conversationId: string;
    senderId: string;
    senderRole: string;
    content: string;
    messageType?: string;
    referenceId?: string | null;
    referenceType?: string | null;
  }): Promise<Message>;
  linkOrderToConversation(conversationId: string, orderId: string, senderId: string): Promise<Message>;
  getConversationMetrics(conversationId: string, userId: string): Promise<ConversationMetrics | null>;
}
