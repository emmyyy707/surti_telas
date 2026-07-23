import { Request, Response } from 'express';
import { z } from 'zod';
import { ok, created } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { PrismaContactMessageRepository } from '../../infrastructure/repositories/PrismaContactMessageRepository';
import { PrismaClient } from '@prisma/client';
import { CreateContactSchema, ListContactSchema } from '../validators/contact.validators';

const prisma = new PrismaClient();
const contactRepository = new PrismaContactMessageRepository(prisma);

export const createContactMessage = async (req: Request, res: Response) => {
  const input = parseDto(CreateContactSchema, req.body);
  const message = await contactRepository.create(input);
  return created(res, message, 'Mensaje de contacto enviado');
};

export const listContactMessages = async (req: Request, res: Response) => {
  const filters = parseDto(ListContactSchema, req.query);
  const messages = await contactRepository.list(filters);
  return ok(res, messages);
};

export const markAsRead = async (req: Request, res: Response) => {
  const message = await contactRepository.markAsRead(req.params.id);
  return ok(res, message, 'Mensaje marcado como leído');
};

export const replyContactMessage = async (req: Request & { user?: { nombre?: string } }, res: Response) => {
  const { respuesta } = parseDto(z.object({ respuesta: z.string().min(1) }), req.body);
  const message = await contactRepository.reply(req.params.id, respuesta, req.user?.nombre ?? 'Sistema');
  return ok(res, message, 'Mensaje respondido');
};

export const closeContactMessage = async (req: Request, res: Response) => {
  const message = await contactRepository.close(req.params.id);
  return ok(res, message, 'Mensaje cerrado');
};
