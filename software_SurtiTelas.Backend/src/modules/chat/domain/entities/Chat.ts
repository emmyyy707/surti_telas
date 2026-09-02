export interface Conversation {
  id: string;
  clientId: string;
  advisorId: string | null;
  status: string;
  subject: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lastMessageAt: Date | null;
}

export interface Message {
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
  sender: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  } | null;
}

export interface ConversationMetrics {
  totalMessages: number;
  unreadMessages: number;
  clientMessages: number;
  advisorMessages: number;
  botMessages: number;
  totalReactions: number;
  responseTimeSeconds: number;
}
