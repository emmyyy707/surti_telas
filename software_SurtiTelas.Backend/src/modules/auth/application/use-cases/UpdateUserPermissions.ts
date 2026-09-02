import type { AuthRepository } from '../../domain/repositories/AuthRepository';

export class UpdateUserPermissions {
  constructor(private readonly repo: AuthRepository) {}

  async execute(userId: string, permissionIds: string[]) {
    await this.repo.setUserPermissions(userId, permissionIds);
  }
}
