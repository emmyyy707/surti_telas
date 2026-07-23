import { PrismaClient } from '@prisma/client';
import { PrismaReturnRepository } from '../repositories/PrismaReturnRepository';
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
  createReturn: new CreateReturn(returnRepository),
  updateReturn: new UpdateReturn(returnRepository),
  changeReturnStatus: new ChangeReturnStatus(returnRepository),
  deleteReturn: new DeleteReturn(returnRepository),
};
