import { PrismaClient } from '@prisma/client';
import type { ChatRepository } from '../../domain/repositories/ChatRepository';
import type { Conversation, Message, ConversationMetrics } from '../../domain/entities/Chat';

function toConversation(row: {
  id: string;
  clientId: string;
  advisorId: string | null;
  status: string;
  subject: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lastMessageAt: Date | null;
}): Conversation {
  return {
    id: row.id,
    clientId: row.clientId,
    advisorId: row.advisorId,
    status: row.status,
    subject: row.subject,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    lastMessageAt: row.lastMessageAt,
  };
}

function toMessage(row: {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  messageType: string;
  senderRole: string;
  status: string;
  referenceId: string | null;
  referenceType: string | null;
  editedAt: Date | null;
  quotedMessageId: string | null;
  sender: { id: string; nombre: string; email: string; role: string } | null;
}): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    content: row.content,
    read: row.read,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    messageType: row.messageType,
    senderRole: row.senderRole,
    status: row.status,
    referenceId: row.referenceId,
    referenceType: row.referenceType,
    editedAt: row.editedAt,
    quotedMessageId: row.quotedMessageId,
    sender: row.sender,
  };
}

export class PrismaChatRepository implements ChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listConversations(userId: string): Promise<Conversation[]> {
    const rows = await this.prisma.conversation.findMany({
      where: {
        deletedAt: null,
        OR: [
          { clientId: userId },
          { advisorId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toConversation);
  }

  async getConversation(id: string, userId: string): Promise<Conversation | null> {
    const row = await this.prisma.conversation.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { clientId: userId },
          { advisorId: userId },
        ],
      },
    });
    if (!row) return null;
    return toConversation(row);
  }

  async listMessages(conversationId: string, userId: string): Promise<Message[]> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        deletedAt: null,
        OR: [
          { clientId: userId },
          { advisorId: userId },
        ],
      },
    });
    if (!conversation) return [];

    const rows = await this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, nombre: true, email: true, role: true },
        },
      },
    });
    return rows.map(toMessage);
  }

  async createMessage(input: {
    conversationId: string;
    senderId: string;
    senderRole: string;
    content: string;
    messageType?: string;
    referenceId?: string | null;
    referenceType?: string | null;
  }): Promise<Message> {
    const row = await this.prisma.message.create({
      data: {
        conversationId: input.conversationId,
        senderId: input.senderId,
        senderRole: input.senderRole,
        content: input.content,
        messageType: input.messageType ?? 'text',
        referenceId: input.referenceId ?? null,
        referenceType: input.referenceType ?? null,
      },
      include: {
        sender: {
          select: { id: true, nombre: true, email: true, role: true },
        },
      },
    });
    await this.prisma.conversation.update({
      where: { id: input.conversationId },
      data: { updatedAt: new Date(), lastMessageAt: new Date() },
    });
    return toMessage(row);
  }

  async linkOrderToConversation(conversationId: string, orderId: string, senderId: string): Promise<Message> {
    const row = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        senderRole: 'ASESOR',
        content: `Pedido vinculado: ${orderId}`,
        messageType: 'order',
        referenceId: orderId,
        referenceType: 'order',
      },
      include: {
        sender: {
          select: { id: true, nombre: true, email: true, role: true },
        },
      },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date(), lastMessageAt: new Date() },
    });
    return toMessage(row);
  }

  async getConversationMetrics(conversationId: string, userId: string): Promise<ConversationMetrics | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        deletedAt: null,
        OR: [
          { clientId: userId },
          { advisorId: userId },
        ],
      },
    });
    if (!conversation) return null;

    const [totalMessages, unreadMessages, clientMessages, advisorMessages, botMessages, totalReactions] = await Promise.all([
      this.prisma.message.count({ where: { conversationId, deletedAt: null } }),
      this.prisma.message.count({ where: { conversationId, deletedAt: null, read: false } }),
      this.prisma.message.count({ where: { conversationId, deletedAt: null, senderRole: 'CLIENTE' } }),
      this.prisma.message.count({ where: { conversationId, deletedAt: null, senderRole: 'ASESOR' } }),
      this.prisma.message.count({ where: { conversationId, deletedAt: null, OR: [{ senderRole: 'BOT' }, { messageType: 'bot' }] } }),
      this.prisma.messageReaction.count({ where: { message: { conversationId, deletedAt: null } } }),
    ]);

    const clientMsgs = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null, senderRole: 'CLIENTE' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    const advisorMsgs = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null, senderRole: 'ASESOR' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    let responseTimeSeconds = 0;
    if (clientMsgs.length > 0 && advisorMsgs.length > 0) {
      let totalMs = 0;
      let count = 0;
      let advisorIdx = 0;
      for (const clientMsg of clientMsgs) {
        while (advisorIdx < advisorMsgs.length && advisorMsgs[advisorIdx].createdAt <= clientMsg.createdAt) {
          advisorIdx++;
        }
        if (advisorIdx < advisorMsgs.length) {
          totalMs += advisorMsgs[advisorIdx].createdAt.getTime() - clientMsg.createdAt.getTime();
          count++;
        }
      }
      responseTimeSeconds = count > 0 ? totalMs / count / 1000 : 0;
    }

    return {
      totalMessages,
      unreadMessages,
      clientMessages,
      advisorMessages,
      botMessages,
      totalReactions,
      responseTimeSeconds,
    };
  }
}
