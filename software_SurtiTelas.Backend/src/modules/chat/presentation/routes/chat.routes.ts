import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import * as controller from '../controllers/chat.controller';

export const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.get('/conversations', asyncHandler(controller.listConversations));
chatRouter.get('/conversations/:conversationId/messages', asyncHandler(controller.listMessages));
chatRouter.post('/messages', asyncHandler(controller.createMessage));
chatRouter.post('/conversations/:conversationId/orders', asyncHandler(controller.linkOrder));
chatRouter.get('/conversations/:conversationId/metrics', asyncHandler(controller.getConversationMetrics));
