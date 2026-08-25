import { prisma } from '../../../../config/database';
import { BcryptPasswordHasher } from '../../../auth/infrastructure/services/BcryptPasswordHasher';
import { PrismaAuthRepository } from '../../../auth/infrastructure/repositories/PrismaAuthRepository';
import { PrismaEmployeeRepository } from '../repositories/PrismaEmployeeRepository';
import { PrismaRoleRepository } from '../repositories/PrismaRoleRepository';
import { CreateEmployee } from '../../application/use-cases/CreateEmployee';
import { ListEmployees } from '../../application/use-cases/EmployeeUseCases';
import { GetEmployee } from '../../application/use-cases/EmployeeUseCases';
import { SearchEmployees } from '../../application/use-cases/EmployeeUseCases';
import { UpdateEmployee } from '../../application/use-cases/EmployeeUseCases';
import { ChangeEmployeeStatus } from '../../application/use-cases/EmployeeUseCases';
import { DeleteEmployee } from '../../application/use-cases/EmployeeUseCases';
import { ListAvailableRoles } from '../../application/use-cases/ListAvailableRoles';

const passwordHasher = new BcryptPasswordHasher();
const authRepository = new PrismaAuthRepository(prisma, passwordHasher);
const employeeRepository = new PrismaEmployeeRepository(prisma, passwordHasher);
const roleRepository = new PrismaRoleRepository(prisma);

export const employeeUseCases = {
  createEmployee: new CreateEmployee(employeeRepository, authRepository),
  listEmployees: new ListEmployees(employeeRepository),
  getEmployee: new GetEmployee(employeeRepository),
  searchEmployees: new SearchEmployees(employeeRepository),
  updateEmployee: new UpdateEmployee(employeeRepository),
  changeEmployeeStatus: new ChangeEmployeeStatus(employeeRepository),
  deleteEmployee: new DeleteEmployee(employeeRepository),
  listAvailableRoles: new ListAvailableRoles(roleRepository),
};
