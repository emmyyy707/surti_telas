import { NotFoundError, ConflictError } from '../../../../shared/domain/errors';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { UserUpdatedEvent, UserDeletedEvent } from '../../../../shared/application/events';

export class UpdateUserStatus {
  constructor(private readonly repo: AuthRepository) {}
  async execute(id: string, estado: 'ACTIVO' | 'INACTIVO') {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Usuario no encontrado');
    const updated = await this.repo.updateStatus(id, estado);
    eventBus.publish(
      new UserUpdatedEvent({
        userId: updated.id,
        nombre: updated.nombre,
        cambios: { estado },
      })
    );
    return updated;
  }
}

export class DeleteUser {
  constructor(private readonly repo: AuthRepository, private readonly prisma: import('@prisma/client').PrismaClient) {}
  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Usuario no encontrado');

    if (existing.role === 'ADMIN') {
      const activeAdmins = await this.prisma.user.count({
        where: { role: 'ADMIN', deletedAt: null },
      });
      if (activeAdmins <= 1) {
        throw new ConflictError('No se puede eliminar el último administrador activo del sistema');
      }
    }

    await this.repo.delete(id);
    eventBus.publish(
      new UserDeletedEvent({
        userId: existing.id,
        nombre: existing.nombre,
      })
    );
  }
}
