import { prisma } from '../../../../config/database';
import { PrismaControlPrendaRepository } from '../repositories/PrismaControlPrendaRepository';
import {
  CreateControlPrenda,
  GetControlPrenda,
  ListControlPrendas,
  ReviewControlPrenda,
  UpdateControlPrenda,
} from '../../application/use-cases';

const controlPrendaRepository = new PrismaControlPrendaRepository(prisma);

export const controlPrendaUseCases = {
  listControlPrendas: new ListControlPrendas(controlPrendaRepository),
  getControlPrenda: new GetControlPrenda(controlPrendaRepository),
  createControlPrenda: new CreateControlPrenda(controlPrendaRepository),
  updateControlPrenda: new UpdateControlPrenda(controlPrendaRepository),
  reviewControlPrenda: new ReviewControlPrenda(controlPrendaRepository),
};
