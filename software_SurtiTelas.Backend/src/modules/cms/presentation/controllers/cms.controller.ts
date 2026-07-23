import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ok, created } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { PrismaCmsPageRepository } from '../../infrastructure/repositories/PrismaCmsPageRepository';
import { CmsFiltersSchema, CreateCmsSchema, UpdateCmsSchema } from '../validators/cms.validators';

const prisma = new PrismaClient();
const cmsPageRepository = new PrismaCmsPageRepository(prisma);

export const listCmsPages = async (req: Request, res: Response) => {
  const filters = parseDto(CmsFiltersSchema, req.query);
  const pages = await cmsPageRepository.list(filters);
  return ok(res, pages);
};

export const getCmsPage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = await cmsPageRepository.getById(id);
  if (!page) {
    return ok(res, null, 'Página no encontrada');
  }
  return ok(res, page);
};

export const createCmsPage = async (req: Request, res: Response) => {
  const input = parseDto(CreateCmsSchema, req.body);
  const page = await cmsPageRepository.create(input);
  return created(res, page, 'Página creada');
};

export const updateCmsPage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const changes = parseDto(UpdateCmsSchema, req.body);
  const page = await cmsPageRepository.update(id, changes);
  return ok(res, page, 'Página actualizada');
};
