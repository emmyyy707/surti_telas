import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ok } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { PrismaCompanyConfigRepository } from '../../infrastructure/repositories/PrismaCompanyConfigRepository';
import { UpdateCompanySchema } from '../validators/company.validators';

const prisma = new PrismaClient();
const companyConfigRepository = new PrismaCompanyConfigRepository(prisma);

export const getCompany = async (_req: Request, res: Response) => {
  const companyConfig = await companyConfigRepository.getCompany();
  return ok(res, companyConfig);
};

export const updateCompany = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateCompanySchema, req.body);
  const companyConfig = await companyConfigRepository.update(changes);
  return ok(res, companyConfig, 'Configuración actualizada');
};
