import type { ChatRepository } from '../../domain/repositories/ChatRepository';

export class ListConversations {
  constructor(private readonly repo: ChatRepository) {}
  execute(userId: string) {
    return this.repo.listConversations(userId);
  }
}

export class GetConversation {
  constructor(private readonly repo: ChatRepository) {}
  async execute(id: string, userId: string) {
    const conversation = await this.repo.getConversation(id, userId);
    if (!conversation) throw new Error('Conversación no encontrada');
    return conversation;
  }
}

export class ListMessages {
  constructor(private readonly repo: ChatRepository) {}
  execute(conversationId: string, userId: string) {
    return this.repo.listMessages(conversationId, userId);
  }
}

export class CreateMessage {
  constructor(private readonly repo: ChatRepository) {}
  async execute(input: {
    conversationId: string;
    senderId: string;
    senderRole: string;
    content: string;
    messageType?: string;
  }) {
    return this.repo.createMessage({
      conversationId: input.conversationId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      content: input.content,
      messageType: input.messageType ?? 'text',
    });
  }
}

export class LinkOrderToConversation {
  constructor(private readonly repo: ChatRepository) {}
  async execute(conversationId: string, orderId: string, senderId: string) {
    const conversation = await this.repo.getConversation(conversationId, senderId);
    if (!conversation) throw new Error('Conversación no encontrada');
    return this.repo.linkOrderToConversation(conversationId, orderId, senderId);
  }
}

export class GetConversationMetrics {
  constructor(private readonly repo: ChatRepository) {}
  async execute(conversationId: string, userId: string) {
    const metrics = await this.repo.getConversationMetrics(conversationId, userId);
    if (!metrics) throw new Error('Conversación no encontrada');
    return metrics;
  }
}
