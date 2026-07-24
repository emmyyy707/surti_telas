import { describe, it, expect, vi } from 'vitest';
import { NotificationService } from '@/modules/notifications/application/NotificationService';
import { NotificationType } from '@prisma/client';

const handlers: Record<string, (event: any) => Promise<void>> = {};

const eventBus = {
  subscribe: vi.fn((type: string, handler: any) => {
    handlers[type] = handler;
  }),
  publish: vi.fn(),
} as any;

const mockPrisma = {
  notification: { create: vi.fn() },
} as any;

describe('NotificationService', () => {
  it('subscribes to order events on construction', () => {
    new NotificationService(mockPrisma as any, eventBus);
    expect(eventBus.subscribe).toHaveBeenCalledWith('order.created', expect.any(Function));
    expect(eventBus.subscribe).toHaveBeenCalledWith('order.status.updated', expect.any(Function));
  });

  it('creates a SUCCESS notification on order.created', async () => {
    new NotificationService(mockPrisma as any, eventBus);
    await handlers['order.created']({
      payload: {
        orderId: 'o-1',
        orderNumero: 'PED-001',
        clienteId: 'c-1',
        clienteNombre: 'Juan',
        asesorId: 'a-1',
        asesorNombre: 'Ana',
        total: 50000,
        itemsCount: 3,
      },
    });

    const data = mockPrisma.notification.create.mock.calls.at(-1)![0].data;
    expect(data.tipo).toBe(NotificationType.SUCCESS);
    expect(data.titulo).toBe('Nuevo pedido creado');
    expect(data.mensaje).toContain('Pedido PED-001 de Juan');
    expect(data.mensaje).toContain('3');
    expect(data.usuarioId).toBe('a-1');
  });

  it('maps status to notification type on order.status.updated', async () => {
    new NotificationService(mockPrisma as any, eventBus);

    await handlers['order.status.updated']({
      payload: {
        orderId: 'o-1',
        orderNumero: 'PED-001',
        previousStatus: 'Nuevo',
        newStatus: 'Cancelado',
        clienteId: 'c-1',
        clienteNombre: 'Juan',
        asesorId: 'a-1',
        asesorNombre: 'Ana',
      },
    });

    const data = mockPrisma.notification.create.mock.calls.at(-1)![0].data;
    expect(data.tipo).toBe(NotificationType.DANGER);
    expect(data.titulo).toBe('Pedido PED-001 actualizado');
    expect(data.mensaje).toBe('Estado cambiado de "Nuevo" a "Cancelado" para el cliente Juan');
    expect(data.usuarioId).toBe('a-1');
  });

  it('falls back to INFO for unknown status', async () => {
    new NotificationService(mockPrisma as any, eventBus);
    await handlers['order.status.updated']({
      payload: {
        orderId: 'o-1',
        orderNumero: 'PED-001',
        previousStatus: 'Nuevo',
        newStatus: 'Desconocido',
        clienteId: 'c-1',
        clienteNombre: 'Juan',
        asesorId: 'a-1',
        asesorNombre: 'Ana',
      },
    });
    expect(mockPrisma.notification.create.mock.calls.at(-1)![0].data.tipo).toBe(NotificationType.INFO);
  });
});
