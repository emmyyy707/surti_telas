import { PrismaClient } from '@prisma/client';
import { PrismaDomiciliarioRepository } from '../repositories/PrismaDomiciliarioRepository';
import { CreateDomiciliario } from '../../application/use-cases/CreateDomiciliario';
import { ListDomiciliarios } from '../../application/use-cases/ListDomiciliarios';
import { GetDomiciliario } from '../../application/use-cases/GetDomiciliario';
import { UpdateDomiciliario } from '../../application/use-cases/UpdateDomiciliario';

const prisma = new PrismaClient();
const domiciliarioRepository = new PrismaDomiciliarioRepository(prisma);

export const domiciliarioUseCases = {
  createDomiciliario: new CreateDomiciliario(domiciliarioRepository),
  listDomiciliarios: new ListDomiciliarios(domiciliarioRepository),
  getDomiciliario: new GetDomiciliario(domiciliarioRepository),
  updateDomiciliario: new UpdateDomiciliario(domiciliarioRepository),
};
