import type { EmployeeRepository, CreateEmployeeInput } from '../../domain/repositories/EmployeeRepository';
import type { Employee } from '../../domain/entities/Employee';
import { ConflictError } from '../../../../shared/domain/errors';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { UserCreatedEvent } from '../../../../shared/application/events';
import type { AuthRepository } from '../../../auth/domain/repositories/AuthRepository';

export class CreateEmployee {
  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly authRepo: AuthRepository
  ) {}

  async execute(input: CreateEmployeeInput): Promise<Employee> {
    const emailLower = input.email.toLowerCase();
    const existing = await this.authRepo.findByEmail(emailLower);
    if (existing) {
      throw new ConflictError('El correo ya está registrado');
    }

    const employee = await this.employeeRepo.create({ ...input, email: emailLower });

    eventBus.publish(
      new UserCreatedEvent({
        userId: employee.id!,
        nombre: employee.nombre,
        email: employee.email,
        role: employee.role,
      })
    );

    return employee;
  }
}
