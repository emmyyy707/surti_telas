import { Request, Response } from 'express';
import { ok, created } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { chatUseCases } from '../../infrastructure/container/chatContainer';
import { CreateMessageSchema, LinkOrderSchema } from '../validators/chat.validators';

export const listConversations = async (req: Request, res: Response) => {
  const conversations = await chatUseCases.listConversations.execute(req.user!.id);
  return ok(res, conversations);
};

export const getConversation = async (req: Request, res: Response) => {
  const conversation = await chatUseCases.getConversation.execute(req.params.id, req.user!.id);
  return ok(res, conversation);
};

export const listMessages = async (req: Request, res: Response) => {
  const messages = await chatUseCases.listMessages.execute(req.params.conversationId, req.user!.id);
  return ok(res, messages);
};

export const createMessage = async (req: Request, res: Response) => {
  const input = parseDto(CreateMessageSchema, req.body);
  const message = await chatUseCases.createMessage.execute({
    ...input,
    senderId: req.user!.id,
    senderRole: req.user!.role,
  });
  return created(res, { message });
};

export const linkOrder = async (req: Request, res: Response) => {
  const input = parseDto(LinkOrderSchema, req.body);
  const message = await chatUseCases.linkOrder.execute(req.params.conversationId, input.orderId, req.user!.id);
  return created(res, { message });
};

export const getConversationMetrics = async (req: Request, res: Response) => {
  const metrics = await chatUseCases.getMetrics.execute(req.params.conversationId, req.user!.id);
  return ok(res, metrics);
};
