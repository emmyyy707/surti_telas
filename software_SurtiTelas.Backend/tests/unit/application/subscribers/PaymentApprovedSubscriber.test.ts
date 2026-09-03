import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentApprovedSubscriber } from '@/modules/sales-orders/application/subscribers/PaymentApprovedSubscriber';
import type { EventBus } from '@/shared/application/EventBus';

vi.mock('@/config/database', () => ({
  prisma: {
    sale: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    payment: { findFirst: vi.fn() },
    order: { findFirst: vi.fn() },
  },
}));

const mockPrisma = vi.mocked(await import('@/config/database')).prisma;

const createMockEventBus = (): EventBus => ({
  publish: vi.fn(),
  subscribe: vi.fn(),
});

const getHandler = (eventBus: EventBus, type: string) =>
  (eventBus.subscribe as any).mock.calls.find(([t]) => t === type)?.[1];

const fireHandler = (handler: (event: unknown) => Promise<void>, event: { type: string; payload: Record<string, unknown> }) =>
  handler({ occurredAt: new Date(), ...event });

describe('PaymentApprovedSubscriber — Regla 1 VENTA = 1 PAGO CONFIRMADO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CASO 1: 1 pedido + 1 pago APPROVED = 1 venta', async () => {
    const eventBus = createMockEventBus();
    new PaymentApprovedSubscriber(eventBus);
    const handler = getHandler(eventBus, 'payment.status.updated');

    mockPrisma.sale.findFirst.mockResolvedValue(null);
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      orderId: 'order-1',
      customerId: 'cli-1',
      amount: { toNumber: () => 1000 },
      method: 'TRANSFER',
      status: 'APPROVED',
      paidAt: new Date('2026-01-01T10:00:00Z'),
      comprobantePagoUrl: 'https://example.com/proof.jpg',
      notes: JSON.stringify({ tipoPago: 'PAGO_INMEDIATO', esAnticipo: false, esSaldo: true }),
    });
    mockPrisma.order.findFirst.mockResolvedValue({
      id: 'order-1',
      clienteId: 'cli-1',
      clienteNombre: 'Cliente X',
      asesorId: 'ase-1',
      asesorNombre: 'Asesor X',
      subtotal: { toNumber: () => 1000 },
      impuestos: { toNumber: () => 0 },
      descuentos: { toNumber: () => 0 },
      comprobantePagoUrl: null,
    });

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-1',
        orderId: 'order-1',
        customerId: 'cli-1',
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        amount: 1000,
        asesorId: 'ase-1',
      },
    });

    expect(mockPrisma.sale.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.sale.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          paymentId: 'pay-1',
          total: 1000,
          paymentStatus: 'APPROVED',
          tipoPago: 'PAGO_INMEDIATO',
          esAnticipo: false,
          esSaldo: true,
          comprobantePagoUrl: 'https://example.com/proof.jpg',
          registradoPorId: 'ase-1',
        }),
      })
    );
  });

  it('CASO 2: pedido no entregado + pago aprobado = 1 venta (sin importar estado del pedido)', async () => {
    const eventBus = createMockEventBus();
    new PaymentApprovedSubscriber(eventBus);
    const handler = getHandler(eventBus, 'payment.status.updated');

    mockPrisma.sale.findFirst.mockResolvedValue(null);
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-2',
      orderId: 'order-pend',
      customerId: 'cli-2',
      amount: { toNumber: () => 5000 },
      method: 'TRANSFER',
      status: 'APPROVED',
      paidAt: new Date(),
      comprobantePagoUrl: null,
      notes: JSON.stringify({ tipoPago: 'PAGO_INMEDIATO' }),
    });
    mockPrisma.order.findFirst.mockResolvedValue({
      id: 'order-pend',
      clienteId: 'cli-2',
      clienteNombre: 'Cliente Pend',
      asesorId: 'ase-1',
      asesorNombre: 'Asesor X',
      subtotal: { toNumber: () => 5000 },
      impuestos: { toNumber: () => 0 },
      descuentos: { toNumber: () => 0 },
      comprobantePagoUrl: null,
    });

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-2',
        orderId: 'order-pend',
        customerId: 'cli-2',
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        amount: 5000,
      },
    });

    expect(mockPrisma.sale.create).toHaveBeenCalledTimes(1);
  });

  it('CASO 3: mismo paymentId APPROVED 2 veces = 1 venta (idempotente)', async () => {
    const eventBus = createMockEventBus();
    new PaymentApprovedSubscriber(eventBus);
    const handler = getHandler(eventBus, 'payment.status.updated');

    // La primera vez no existe venta; la segunda vez ya existe.
    mockPrisma.sale.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'sale-1' });

    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-dup',
      orderId: 'order-dup',
      customerId: 'cli-1',
      amount: { toNumber: () => 100 },
      method: 'CASH',
      status: 'APPROVED',
      paidAt: new Date(),
      comprobantePagoUrl: null,
      notes: JSON.stringify({ tipoPago: 'PAGO_INMEDIATO' }),
    });
    mockPrisma.order.findFirst.mockResolvedValue({
      id: 'order-dup',
      clienteId: 'cli-1',
      clienteNombre: 'C',
      asesorId: 'ase-1',
      asesorNombre: 'A',
      subtotal: { toNumber: () => 100 },
      impuestos: { toNumber: () => 0 },
      descuentos: { toNumber: () => 0 },
      comprobantePagoUrl: null,
    });

    const payload = {
      paymentId: 'pay-dup',
      orderId: 'order-dup',
      customerId: 'cli-1',
      previousStatus: 'PENDING' as const,
      newStatus: 'APPROVED' as const,
      amount: 100,
    };

    await fireHandler(handler, { type: 'payment.status.updated', payload });
    await fireHandler(handler, { type: 'payment.status.updated', payload });

    expect(mockPrisma.sale.create).toHaveBeenCalledTimes(1);
  });

  it('CASO 4: pago REJECTED = 0 ventas nuevas', async () => {
    const eventBus = createMockEventBus();
    new PaymentApprovedSubscriber(eventBus);
    const handler = getHandler(eventBus, 'payment.status.updated');

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-rej',
        orderId: 'order-rej',
        customerId: 'cli-1',
        previousStatus: 'PENDING',
        newStatus: 'REJECTED',
        amount: 100,
      },
    });

    expect(mockPrisma.sale.create).not.toHaveBeenCalled();
  });

  it('CASO 5: pago PENDING = 0 ventas nuevas', async () => {
    const eventBus = createMockEventBus();
    new PaymentApprovedSubscriber(eventBus);
    const handler = getHandler(eventBus, 'payment.status.updated');

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-pend',
        orderId: 'order-pend',
        customerId: 'cli-1',
        previousStatus: 'PENDING',
        newStatus: 'PENDING',
        amount: 100,
      },
    });

    expect(mockPrisma.sale.create).not.toHaveBeenCalled();
  });

  it('CASO 6: pago ANULADO con venta existente = marca la venta como ANULADA', async () => {
    const eventBus = createMockEventBus();
    new PaymentApprovedSubscriber(eventBus);
    const handler = getHandler(eventBus, 'payment.status.updated');

    mockPrisma.sale.findFirst.mockResolvedValue({ id: 'sale-anu', paymentId: 'pay-anu' });

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-anu',
        orderId: 'order-anu',
        customerId: 'cli-1',
        previousStatus: 'APPROVED',
        newStatus: 'ANULADO',
        amount: 100,
      },
    });

    expect(mockPrisma.sale.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sale-anu' },
        data: expect.objectContaining({ estado: 'ANULADA', paymentStatus: 'ANULADO' }),
      })
    );
  });

  it('CASO 7: pago REFUNDED con venta existente = marca la venta como ANULADA + paymentStatus REFUNDED', async () => {
    const eventBus = createMockEventBus();
    new PaymentApprovedSubscriber(eventBus);
    const handler = getHandler(eventBus, 'payment.status.updated');

    mockPrisma.sale.findFirst.mockResolvedValue({ id: 'sale-ref', paymentId: 'pay-ref' });

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-ref',
        orderId: 'order-ref',
        customerId: 'cli-1',
        previousStatus: 'APPROVED',
        newStatus: 'REFUNDED',
        amount: 100,
      },
    });

    expect(mockPrisma.sale.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sale-ref' },
        data: expect.objectContaining({ estado: 'ANULADA', paymentStatus: 'REFUNDED' }),
      })
    );
  });

  it('CASO 8: 1 pedido + múltiples pagos APPROVED = 1 venta por cada pago', async () => {
    const eventBus = createMockEventBus();
    new PaymentApprovedSubscriber(eventBus);
    const handler = getHandler(eventBus, 'payment.status.updated');

    // Pago 1: sin venta previa.
    mockPrisma.sale.findFirst.mockResolvedValueOnce(null);
    mockPrisma.payment.findFirst.mockResolvedValueOnce({
      id: 'pay-cuota-1',
      orderId: 'order-cuotas',
      customerId: 'cli-1',
      amount: { toNumber: () => 5000 },
      method: 'TRANSFER',
      status: 'APPROVED',
      paidAt: new Date('2026-02-01'),
      comprobantePagoUrl: null,
      notes: JSON.stringify({ tipoPago: 'ABONO_INICIAL', esAnticipo: true, esSaldo: false, numeroCuota: 1, totalCuotas: 3 }),
    });
    mockPrisma.order.findFirst.mockResolvedValueOnce({
      id: 'order-cuotas',
      clienteId: 'cli-1',
      clienteNombre: 'C',
      asesorId: 'ase-1',
      asesorNombre: 'A',
      subtotal: { toNumber: () => 15000 },
      impuestos: { toNumber: () => 0 },
      descuentos: { toNumber: () => 0 },
      comprobantePagoUrl: null,
    });

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-cuota-1',
        orderId: 'order-cuotas',
        customerId: 'cli-1',
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        amount: 5000,
      },
    });

    // Pago 2: sin venta previa.
    mockPrisma.sale.findFirst.mockResolvedValueOnce(null);
    mockPrisma.payment.findFirst.mockResolvedValueOnce({
      id: 'pay-cuota-2',
      orderId: 'order-cuotas',
      customerId: 'cli-1',
      amount: { toNumber: () => 5000 },
      method: 'TRANSFER',
      status: 'APPROVED',
      paidAt: new Date('2026-03-01'),
      comprobantePagoUrl: null,
      notes: JSON.stringify({ tipoPago: 'CUOTA', esAnticipo: false, esSaldo: false, numeroCuota: 2, totalCuotas: 3 }),
    });
    mockPrisma.order.findFirst.mockResolvedValueOnce({
      id: 'order-cuotas',
      clienteId: 'cli-1',
      clienteNombre: 'C',
      asesorId: 'ase-1',
      asesorNombre: 'A',
      subtotal: { toNumber: () => 15000 },
      impuestos: { toNumber: () => 0 },
      descuentos: { toNumber: () => 0 },
      comprobantePagoUrl: null,
    });

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-cuota-2',
        orderId: 'order-cuotas',
        customerId: 'cli-1',
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        amount: 5000,
      },
    });

    // Pago 3 (saldo): sin venta previa.
    mockPrisma.sale.findFirst.mockResolvedValueOnce(null);
    mockPrisma.payment.findFirst.mockResolvedValueOnce({
      id: 'pay-cuota-3',
      orderId: 'order-cuotas',
      customerId: 'cli-1',
      amount: { toNumber: () => 5000 },
      method: 'TRANSFER',
      status: 'APPROVED',
      paidAt: new Date('2026-04-01'),
      comprobantePagoUrl: null,
      notes: JSON.stringify({ tipoPago: 'PAGO_SALDO', esAnticipo: false, esSaldo: true, numeroCuota: 3, totalCuotas: 3 }),
    });
    mockPrisma.order.findFirst.mockResolvedValueOnce({
      id: 'order-cuotas',
      clienteId: 'cli-1',
      clienteNombre: 'C',
      asesorId: 'ase-1',
      asesorNombre: 'A',
      subtotal: { toNumber: () => 15000 },
      impuestos: { toNumber: () => 0 },
      descuentos: { toNumber: () => 0 },
      comprobantePagoUrl: null,
    });

    await fireHandler(handler, {
      type: 'payment.status.updated',
      payload: {
        paymentId: 'pay-cuota-3',
        orderId: 'order-cuotas',
        customerId: 'cli-1',
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        amount: 5000,
      },
    });

    // 3 ventas creadas, 1 por cada pago.
    expect(mockPrisma.sale.create).toHaveBeenCalledTimes(3);
    const sales = (mockPrisma.sale.create as any).mock.calls.map((c: any) => c[0].data);
    expect(sales.map((s: any) => s.paymentId).sort()).toEqual(['pay-cuota-1', 'pay-cuota-2', 'pay-cuota-3']);
    expect(sales.map((s: any) => s.tipoPago).sort()).toEqual(['ABONO_INICIAL', 'CUOTA', 'PAGO_SALDO']);
  });
});
