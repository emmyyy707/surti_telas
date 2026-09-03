import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderReceiptPaymentSubscriber } from '@/modules/orders/application/use-cases/OrderReceiptPaymentSubscriber';
import type { EventBus } from '@/shared/application/EventBus';

vi.mock('@/config/database', () => ({
  prisma: {
    payment: { findMany: vi.fn() },
    sale: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

const mockPrisma = vi.mocked(await import('@/config/database')).prisma;

const createMockEventBus = (): EventBus => ({
  publish: vi.fn(),
  subscribe: vi.fn(),
});

const getHandler = (eventBus: EventBus, type: string) =>
  (eventBus.subscribe as any).mock.calls.find(([t]) => t === type)?.[1];

describe('OrderReceiptPaymentSubscriber - entrega ya no crea ventas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('order.delivered: NO crea ni actualiza ventas; solo lista pagos existentes', async () => {
    const eventBus = createMockEventBus();
    new OrderReceiptPaymentSubscriber(eventBus);
    const handler = getHandler(eventBus, 'order.delivered');
    expect(handler).toBeDefined();

    mockPrisma.payment.findMany.mockResolvedValue([
      { id: 'p-1', status: 'APPROVED' },
      { id: 'p-2', status: 'PENDING' },
    ]);

    await handler({
      type: 'order.delivered',
      occurredAt: new Date(),
      payload: {
        orderId: 'order-1',
        orderNumero: 'PED-0001',
        clienteId: 'cli-1',
        clienteNombre: 'Cliente Test',
        asesorId: 'ase-1',
        asesorNombre: 'Asesor Test',
        total: 1190,
      },
    });

    expect(mockPrisma.sale.create).not.toHaveBeenCalled();
    expect(mockPrisma.sale.update).not.toHaveBeenCalled();
  });
});
