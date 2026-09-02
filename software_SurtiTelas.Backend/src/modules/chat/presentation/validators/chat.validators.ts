import { z } from 'zod';

export const CreateMessageSchema = z.object({
  conversationId: z.string().min(1, 'El ID de la conversación es obligatorio'),
  content: z.string().min(1, 'El contenido del mensaje es obligatorio'),
  messageType: z.string().optional(),
});

export const LinkOrderSchema = z.object({
  orderId: z.string().min(1, 'El ID del pedido es obligatorio'),
});
