export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sender: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  } | null;
}

export interface Conversation {
  id: string;
  clientId: string;
  advisorId: string | null;
  status: 'OPEN' | 'CLOSED';
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
