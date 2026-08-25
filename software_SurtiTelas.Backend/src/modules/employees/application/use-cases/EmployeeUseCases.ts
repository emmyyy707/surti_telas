import type { EmployeeRepository, EmployeeFilters, UpdateEmployeeInput } from '../../domain/repositories/EmployeeRepository';
import type { Employee } from '../../domain/entities/Employee';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { UserUpdatedEvent, UserDeletedEvent } from '../../../../shared/application/events';
import { NotFoundError } from '../../../../shared/domain/errors';

export class ListEmployees {
  constructor(private readonly repo: EmployeeRepository) {}

  execute(filters?: EmployeeFilters) {
    return this.repo.list(filters);
  }
}

export class GetEmployee {
  constructor(private readonly repo: EmployeeRepository) {}

  execute(id: string): Promise<Employee | null> {
    return this.repo.getById(id);
  }
}

export class SearchEmployees {
  constructor(private readonly repo: EmployeeRepository) {}

  execute(query: string): Promise<Employee[]> {
    if (!query || query.trim().length < 2) {
      return Promise.resolve([]);
    }
    return this.repo.search(query);
  }
}

export class UpdateEmployee {
  constructor(private readonly repo: EmployeeRepository) {}

  execute(id: string, changes: UpdateEmployeeInput) {
    return this.repo.update(id, changes);
  }
}

export class ChangeEmployeeStatus {
  constructor(private readonly repo: EmployeeRepository) {}

  async execute(id: string, estado: 'ACTIVO' | 'INACTIVO') {
    const updated = await this.repo.changeStatus(id, estado);
    eventBus.publish(
      new UserUpdatedEvent({
        userId: updated.id!,
        nombre: updated.nombre,
        cambios: { estado },
      })
    );
    return updated;
  }
}

export class DeleteEmployee {
  constructor(
    private readonly repo: EmployeeRepository
  ) {}

  async execute(id: string): Promise<void> {
    const employee = await this.repo.getById(id);
    if (!employee) {
      throw new NotFoundError('Empleado no encontrado');
    }
    await this.repo.delete(id);
    eventBus.publish(
      new UserDeletedEvent({
        userId: employee.id!,
        nombre: employee.nombre,
      })
    );
  }
}
