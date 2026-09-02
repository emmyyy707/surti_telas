import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderReceiptPaymentSubscriber } from '@/modules/orders/application/use-cases/OrderReceiptPaymentSubscriber';
import type { EventBus } from '@/shared/application/EventBus';

vi.mock('@/config/database', () => ({
  prisma: {
    payment: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    sale: { findFirst: vi.fn(), create: vi.fn() },
    order: { findFirst: vi.fn() },
  },
}));

const mockPrisma = vi.mocked(await import('@/config/database')).prisma;

const createMockEventBus = (): EventBus => ({
  publish: vi.fn(),
  subscribe: vi.fn(),
});

describe('OrderReceiptPaymentSubscriber', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a Sale when order is delivered and no Sale exists (BUG-2)', async () => {
    const eventBus = createMockEventBus();
    new OrderReceiptPaymentSubscriber(eventBus);

    const subscribeHandler = (eventBus.subscribe as any).mock.calls.find(([type]) => type === 'order.delivered')?.[1];
    expect(subscribeHandler).toBeDefined();

    mockPrisma.payment.findFirst.mockResolvedValue(null);
    mockPrisma.sale.findFirst.mockResolvedValue(null);
    mockPrisma.order.findFirst.mockResolvedValue({
      subtotal: 1000,
      impuestos: 190,
      descuentos: 0,
      total: 1190,
      medioPago: 'TRANSFER',
    });
    mockPrisma.payment.create.mockResolvedValue({ id: 'payment-1' });
    mockPrisma.sale.create.mockResolvedValue({ id: 'sale-1' });

    await subscribeHandler({
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

    expect(mockPrisma.sale.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-1',
        clienteId: 'cli-1',
        clienteNombre: 'Cliente Test',
        asesorId: 'ase-1',
        asesorNombre: 'Asesor Test',
        fechaVenta: expect.any(Date),
        subtotal: 1000,
        impuestos: 190,
        descuentos: 0,
        total: 1190,
        estado: 'COMPLETADA',
        medioPago: 'TRANSFER',
      },
    });
  });

  it('does not create a duplicate Sale when one already exists', async () => {
    const eventBus = createMockEventBus();
    new OrderReceiptPaymentSubscriber(eventBus);

    const subscribeHandler = (eventBus.subscribe as any).mock.calls.find(([type]) => type === 'order.delivered')?.[1];
    expect(subscribeHandler).toBeDefined();

    mockPrisma.payment.findFirst.mockResolvedValue(null);
    mockPrisma.sale.findFirst.mockResolvedValue({ id: 'sale-existing' });

    await subscribeHandler({
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
  });
});
