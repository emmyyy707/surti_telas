import { NotFoundError } from '../../../../shared/domain/errors';
import type {
  CreateCustomerInput,
  CustomerFilters,
  CustomerRepository,
  UpdateCustomerInput,
} from '../../domain/repositories/CustomerRepository';

export class CreateCustomer {
  constructor(private readonly repo: CustomerRepository) {}
  execute(input: CreateCustomerInput) {
    return this.repo.create(input);
  }
}

export class GetCustomers {
  constructor(private readonly repo: CustomerRepository) {}
  execute(filters?: CustomerFilters) {
    return this.repo.list(filters);
  }
}

export class GetCustomerById {
  constructor(private readonly repo: CustomerRepository) {}
  async execute(id: string) {
    const customer = await this.repo.getById(id);
    if (!customer) throw new NotFoundError('Cliente no encontrado');
    return customer;
  }
}

export class UpdateCustomer {
  constructor(private readonly repo: CustomerRepository) {}
  execute(id: string, changes: UpdateCustomerInput) {
    return this.repo.update(id, changes);
  }
}

export class AssignAsesor {
  constructor(private readonly repo: CustomerRepository) {}
  execute(id: string, asesorId: string) {
    return this.repo.assignAsesor(id, asesorId);
  }
}

export class UpdateCupo {
  constructor(private readonly repo: CustomerRepository) {}
  execute(id: string, cupoTotal?: number, cupoUsado?: number, deudaVencida?: number) {
    return this.repo.updateCupo(id, cupoTotal, cupoUsado, deudaVencida);
  }
}

export class DeleteCustomer {
  constructor(private readonly repo: CustomerRepository) {}
  async execute(id: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Cliente no encontrado');
    await this.repo.delete(id);
  }
}
