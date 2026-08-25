import type { RoleRepository, RoleConfigData } from '../../domain/repositories/EmployeeRepository';

export class ListAvailableRoles {
  constructor(private readonly repo: RoleRepository) {}

  execute(): Promise<RoleConfigData[]> {
    return this.repo.listAvailableRoles();
  }
}
