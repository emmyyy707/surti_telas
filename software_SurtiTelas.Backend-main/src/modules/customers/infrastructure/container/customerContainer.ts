import { prisma } from '../../../../config/database';
import { PrismaCustomerRepository } from '../repositories/PrismaCustomerRepository';
import {
  AssignAsesor,
  CreateCustomer,
  DeleteCustomer,
  GetCustomerById,
  GetCustomers,
  UpdateCustomer,
  UpdateCupo,
} from '../../application/use-cases/CustomerUseCases';

const customerRepository = new PrismaCustomerRepository(prisma);

export const customerUseCases = {
  createCustomer: new CreateCustomer(customerRepository),
  getCustomers: new GetCustomers(customerRepository),
  getCustomerById: new GetCustomerById(customerRepository),
  updateCustomer: new UpdateCustomer(customerRepository),
  assignAsesor: new AssignAsesor(customerRepository),
  updateCupo: new UpdateCupo(customerRepository),
  deleteCustomer: new DeleteCustomer(customerRepository),
};
