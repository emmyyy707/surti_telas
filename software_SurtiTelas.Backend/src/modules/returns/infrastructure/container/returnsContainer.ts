import { PrismaClient } from '@prisma/client';
import { PrismaReturnRepository } from '../repositories/PrismaReturnRepository';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import {
  ChangeReturnStatus,
  CreateReturn,
  DeleteReturn,
  GetReturn,
  ListReturns,
  UpdateReturn,
} from '../../application/use-cases/ReturnUseCases';

const prisma = new PrismaClient();

const returnRepository = new PrismaReturnRepository(prisma);

export const returnsUseCases = {
  listReturns: new ListReturns(returnRepository),
  getReturn: new GetReturn(returnRepository),
  createReturn: new CreateReturn(returnRepository, prisma, eventBus),
  updateReturn: new UpdateReturn(returnRepository, eventBus),
  changeReturnStatus: new ChangeReturnStatus(returnRepository, eventBus),
  deleteReturn: new DeleteReturn(returnRepository, eventBus),
};
