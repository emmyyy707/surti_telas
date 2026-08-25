import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSales } from '@/modules/sales-orders/application/use-cases/GetSales';
import { GetSaleById } from '@/modules/sales-orders/application/use-cases/GetSaleById';
import { CancelSale } from '@/modules/sales-orders/application/use-cases/CancelSale';
import { AddSaleItem } from '@/modules/sales-orders/application/use-cases/AddSaleItem';
import { BadRequestError, NotFoundError } from '@/shared/domain/errors';
import type { SaleRepository } from '@/modules/sales-orders/domain/repositories/SaleRepository';

vi.mock('@/config/database', () => ({
  prisma: {
    $transaction: vi.fn(),
    sale: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    order: { findFirst: vi.fn() },
    orderItem: { create: vi.fn(), delete: vi.fn(), findFirst: vi.fn() },
    product: { findUnique: vi.fn() },
    payment: { findMany: vi.fn() },
    custom_orders: { findFirst: vi.fn() },
  },
}));

import { prisma } from '@/config/database';

function createMockSaleRepo(): SaleRepository {
  return {
    create: vi.fn(),
    findByOrderId: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    cancel: vi.fn(),
    updateTotals: vi.fn(),
    findByIdWithOrder: vi.fn(),
  } as unknown as SaleRepository;
}

function createMockSaleWithOrder(overrides: Partial<SaleWithOrder> = {}): SaleWithOrder {
  return {
    id: 'sale-1',
    orderId: 'order-1',
    clienteId: 'client-1',
    clienteNombre: 'Juan Pérez',
    asesorId: 'asesor-1',
    asesorNombre: 'Asesor Test',
    fechaVenta: new Date().toISOString(),
    subtotal: 50000,
    impuestos: 0,
    descuentos: 0,
    total: 50000,
    estado: 'COMPLETADA',
    motivoAnulacion: undefined,
    medioPago: 'TRANSFER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: {
      id: 'order-1',
      numero: 'PED-000001',
      estado: 'RECIBO_GENERADO',
      tipoFlujo: 'VENTAS',
      fecha: new Date().toISOString(),
      medioPago: 'TRANSFER',
      items: [{ id: 'item-1', nombre: 'Camiseta', precio: 25000, cantidad: 2 }],
      payment: null,
      receipt: { id: 'receipt-1', numero: 'REC-000001', estado: 'BORRADOR', estadoEnvio: null },
      customOrder: null,
    },
    ...overrides,
  };
}

function createMockPrismaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sale-1',
    orderId: 'order-1',
    clienteId: 'client-1',
    clienteNombre: 'Juan Pérez',
    asesorId: 'asesor-1',
    asesorNombre: 'Asesor Test',
    fechaVenta: new Date(),
    subtotal: { toNumber: () => 50000 },
    impuestos: { toNumber: () => 0 },
    descuentos: { toNumber: () => 0 },
    total: { toNumber: () => 50000 },
    estado: 'COMPLETADA',
    motivoAnulacion: null,
    medioPago: 'TRANSFER',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: {
      id: 'order-1',
      numero: 'PED-000001',
      estado: 'RECIBO_GENERADO',
      tipoFlujo: 'VENTAS',
      fecha: new Date(),
      medioPago: 'TRANSFER',
      items: [{ id: 'item-1', nombre: 'Camiseta', precio: { toNumber: () => 25000 }, cantidad: 2, productId: 'prod-1' }],
      payments: [],
      receipts: [{ id: 'r-1', numero: 'REC-000001', estado: 'BORRADOR', estadoEnvio: null }],
      custom_orders: null,
    },
    ...overrides,
  };
}

describe('GetSales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated sales with filters', async () => {
    const mockRows = [createMockPrismaRow(), createMockPrismaRow({ id: 'sale-2' })];
    (prisma.$transaction as any).mockResolvedValue([mockRows, 2]);

    const useCase = new GetSales(prisma as any);
    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(prisma.sale.findMany).toHaveBeenCalled();
    expect(prisma.sale.count).toHaveBeenCalled();
  });

  it('should apply estado filter', async () => {
    (prisma.$transaction as any).mockResolvedValue([[], 0]);
    const useCase = new GetSales(prisma as any);
    await useCase.execute({ estado: 'ANULADA' });

    const findManyCall = (prisma.sale.findMany as any).mock.calls[0][0];
    expect(findManyCall.where.estado).toBe('ANULADA');
  });

  it('should apply search term', async () => {
    (prisma.$transaction as any).mockResolvedValue([[], 0]);
    const useCase = new GetSales(prisma as any);
    await useCase.execute({ search: 'Juan' });

    const findManyCall = (prisma.sale.findMany as any).mock.calls[0][0];
    expect(findManyCall.where.AND).toBeDefined();
    const orClause = findManyCall.where.AND.find((c: { OR?: unknown }) => c.OR !== undefined);
    expect(orClause).toBeDefined();
  });

  it('should default to page 1, limit 50', async () => {
    (prisma.$transaction as any).mockResolvedValue([[], 0]);
    const useCase = new GetSales(prisma as any);
    const result = await useCase.execute();

    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
  });

  it('should return empty list when no sales', async () => {
    (prisma.$transaction as any).mockResolvedValue([[], 0]);
    const useCase = new GetSales(prisma as any);
    const result = await useCase.execute();

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe('GetSaleById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return sale with custom order', async () => {
    const mockSale = createMockSaleWithOrder();
    const mockRepo = createMockSaleRepo();
    (mockRepo.findByIdWithOrder as any).mockResolvedValue(mockSale);
    (prisma.custom_orders.findFirst as any).mockResolvedValue({
      id: 'cot-1',
      numero: 'COT-000001',
      estado: 'APROBADA',
    });

    const useCase = new GetSaleById(prisma as any, mockRepo);
    const result = await useCase.execute('sale-1');

    expect(result.id).toBe('sale-1');
    expect(result.order?.customOrder).toEqual({ id: 'cot-1', numero: 'COT-000001', estado: 'APROBADA' });
  });

  it('should set customOrder to null when not found', async () => {
    const mockSale = createMockSaleWithOrder();
    const mockRepo = createMockSaleRepo();
    (mockRepo.findByIdWithOrder as any).mockResolvedValue(mockSale);
    (prisma.custom_orders.findFirst as any).mockResolvedValue(null);

    const useCase = new GetSaleById(prisma as any, mockRepo);
    const result = await useCase.execute('sale-1');

    expect(result.order?.customOrder).toBeNull();
  });

  it('should throw NotFoundError when sale does not exist', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findByIdWithOrder as any).mockResolvedValue(null);

    const useCase = new GetSaleById(prisma as any, mockRepo);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('should not query custom_orders when order is null', async () => {
    const mockSale = createMockSaleWithOrder({ order: undefined as any });
    const mockRepo = createMockSaleRepo();
    (mockRepo.findByIdWithOrder as any).mockResolvedValue(mockSale);

    const useCase = new GetSaleById(prisma as any, mockRepo);
    await useCase.execute('sale-1');

    expect(prisma.custom_orders.findFirst).not.toHaveBeenCalled();
  });
});

describe('CancelSale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cancel sale with valid motivo', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
    });
    (prisma.order.findFirst as any).mockResolvedValue({ estado: 'RECIBO_GENERADO' });
    (prisma.payment.findMany as any).mockResolvedValue([]);
    (prisma.$transaction as any).mockResolvedValue(true);

    const useCase = new CancelSale(mockRepo);
    await expect(useCase.execute('sale-1', 'Cliente no cumplió con los términos')).resolves.toBeUndefined();

    expect(mockRepo.findById).toHaveBeenCalledWith('sale-1');
  });

  it('should throw BadRequestError when motivo is too short', async () => {
    const mockRepo = createMockSaleRepo();
    const useCase = new CancelSale(mockRepo);

    await expect(useCase.execute('sale-1', 'ab')).rejects.toThrow(BadRequestError);
  });

  it('should throw BadRequestError when motivo is empty', async () => {
    const mockRepo = createMockSaleRepo();
    const useCase = new CancelSale(mockRepo);

    await expect(useCase.execute('sale-1', '')).rejects.toThrow(BadRequestError);
  });

  it('should throw NotFoundError when sale does not exist', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue(null);

    const useCase = new CancelSale(mockRepo);
    await expect(useCase.execute('nonexistent', 'Motivo válido')).rejects.toThrow(NotFoundError);
  });

  it('should throw BadRequestError when sale is already anulada', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'ANULADA',
    });

    const useCase = new CancelSale(mockRepo);
    await expect(useCase.execute('sale-1', 'Otro motivo')).rejects.toThrow(BadRequestError);
  });

  it('should throw NotFoundError when order is not found', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
    });
    (prisma.order.findFirst as any).mockResolvedValue(null);

    const useCase = new CancelSale(mockRepo);
    await expect(useCase.execute('sale-1', 'Motivo válido')).rejects.toThrow(NotFoundError);
  });

  it('should throw BadRequestError when order state is not cancelable', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
    });
    (prisma.order.findFirst as any).mockResolvedValue({ estado: 'ENTREGADO' });

    const useCase = new CancelSale(mockRepo);
    await expect(useCase.execute('sale-1', 'Motivo válido')).rejects.toThrow(BadRequestError);
  });

  it('should execute transaction when cancellation is valid', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
    });
    (prisma.order.findFirst as any).mockResolvedValue({ estado: 'NUEVO' });
    (prisma.payment.findMany as any).mockResolvedValue([]);
    const txMock = vi.fn().mockResolvedValue(true);
    (prisma.$transaction as any).mockImplementation(txMock);

    const useCase = new CancelSale(mockRepo);
    await useCase.execute('sale-1', 'Cliente canceló');

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txMock).toHaveBeenCalled();
  });
});

describe('GetSales customOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return customOrder data when order has a custom order', async () => {
    const mockRow = createMockPrismaRow({
      order: {
        id: 'order-1',
        numero: 'PED-000001',
        estado: 'RECIBO_GENERATED',
        tipoFlujo: 'VENTAS',
        fecha: new Date(),
        medioPago: 'TRANSFER',
        items: [{ id: 'item-1', nombre: 'Camiseta', precio: { toNumber: () => 25000 }, cantidad: 2, productId: 'prod-1' }],
        payments: [],
        receipts: [],
        custom_orders: { id: 'cot-1', numero: 'COT-000001', estado: 'APROBADA' },
      },
    });
    (prisma.$transaction as any).mockResolvedValue([[mockRow], 1]);

    const useCase = new GetSales(prisma as any);
    const result = await useCase.execute({ page: 1, limit: 50 });

    expect(result.items[0].order?.customOrder).toEqual({
      id: 'cot-1',
      numero: 'COT-000001',
      estado: 'APROBADA',
    });
  });

  it('should return customOrder null when order has no custom order', async () => {
    const mockRow = createMockPrismaRow();
    (prisma.$transaction as any).mockResolvedValue([[mockRow], 1]);

    const useCase = new GetSales(prisma as any);
    const result = await useCase.execute({ page: 1, limit: 50 });

    expect(result.items[0].order?.customOrder).toBeNull();
  });
});

describe('AddSaleItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockSaleRepo(): SaleRepository {
    return {
      create: vi.fn(),
      findByOrderId: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      cancel: vi.fn(),
      updateTotals: vi.fn(),
      findByIdWithOrder: vi.fn(),
    } as unknown as SaleRepository;
  }

  it('should not duplicate existing items when adding a new item', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
      subtotal: 50000,
      impuestos: 0,
      descuentos: 0,
    });
    (prisma.order.findFirst as any).mockResolvedValue({
      id: 'order-1',
      estado: 'RECIBO_GENERATED',
      items: [
        { id: 'item-1', nombre: 'Camiseta', precio: { toNumber: () => 25000 }, cantidad: 2 },
      ],
    });

    let capturedTotals: { subtotal: number; impuestos: number; total: number } | null = null;
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        orderItem: { create: vi.fn().mockResolvedValue({ id: 'item-2' }) },
        order: {
          update: vi.fn().mockImplementation((args: any) => {
            capturedTotals = args.data;
            return { id: 'order-1' };
          }),
        },
        sale: { update: vi.fn().mockResolvedValue({}) },
        orderHistory: { create: vi.fn().mockResolvedValue({ id: 'hist-1' }) },
      };
      return cb(tx);
    });

    const useCase = new AddSaleItem(mockRepo);
    await useCase.execute('sale-1', {
      nombre: 'Pantalón',
      precio: 30000,
      cantidad: 1,
    });

    expect(capturedTotals).not.toBeNull();
    const { subtotal, impuestos, total } = capturedTotals!;

    const expectedSubtotal = (25000 * 2) + (30000 * 1);
    expect(subtotal).toBe(expectedSubtotal);

    const expectedImpuestos = Math.round(expectedSubtotal * 0.19);
    expect(impuestos).toBe(expectedImpuestos);

    const expectedTotal = expectedSubtotal + expectedImpuestos;
    expect(total).toBe(expectedTotal);
  });

  it('should not recount existing items when adding a second product', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
      subtotal: 100000,
      impuestos: 19000,
      descuentos: 0,
    });
    (prisma.order.findFirst as any).mockResolvedValue({
      id: 'order-1',
      estado: 'RECIBO_GENERADO',
      items: [
        { id: 'item-1', nombre: 'Camiseta', precio: { toNumber: () => 25000 }, cantidad: 2 },
        { id: 'item-2', nombre: 'Pantalón', precio: { toNumber: () => 50000 }, cantidad: 1 },
      ],
    });

    let capturedTotals: { subtotal: number; impuestos: number; total: number } | null = null;
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        orderItem: { create: vi.fn().mockResolvedValue({ id: 'item-3' }) },
        order: {
          update: vi.fn().mockImplementation((args: any) => {
            capturedTotals = args.data;
            return { id: 'order-1' };
          }),
        },
        sale: { update: vi.fn().mockResolvedValue({}) },
        orderHistory: { create: vi.fn().mockResolvedValue({ id: 'hist-1' }) },
      };
      return cb(tx);
    });

    const useCase = new AddSaleItem(mockRepo);
    await useCase.execute('sale-1', {
      nombre: 'Gorra',
      precio: 10000,
      cantidad: 3,
    });

    expect(capturedTotals).not.toBeNull();
    const { subtotal, impuestos, total } = capturedTotals!;

    const expectedSubtotal = (25000 * 2) + (50000 * 1) + (10000 * 3);
    expect(subtotal).toBe(expectedSubtotal);

    const expectedImpuestos = Math.round(expectedSubtotal * 0.19);
    expect(impuestos).toBe(expectedImpuestos);

    const expectedTotal = expectedSubtotal + expectedImpuestos;
    expect(total).toBe(expectedTotal);
  });

  it('should throw NotFoundError when sale does not exist', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue(null);

    const useCase = new AddSaleItem(mockRepo);
    await expect(
      useCase.execute('nonexistent', { nombre: 'Test', precio: 100, cantidad: 1 }),
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw BadRequestError when order is in terminal state', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
    });
    (prisma.order.findFirst as any).mockResolvedValue({
      id: 'order-1',
      estado: 'ENTREGADO',
      items: [],
    });

    const useCase = new AddSaleItem(mockRepo);
    await expect(
      useCase.execute('sale-1', { nombre: 'Test', precio: 100, cantidad: 1 }),
    ).rejects.toThrow(BadRequestError);
  });

  it('should override precio with product catalog price when productId provided', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
      subtotal: 50000,
      impuestos: 0,
      descuentos: 0,
    });
    (prisma.order.findFirst as any).mockResolvedValue({
      id: 'order-1',
      estado: 'RECIBO_GENERATED',
      items: [{ id: 'item-1', nombre: 'Camiseta', precio: { toNumber: () => 25000 }, cantidad: 2 }],
    });
    (prisma.product.findUnique as any).mockResolvedValue({
      id: 'prod-2',
      nombre: 'Pantalón de Jean',
      precio: { toNumber: () => 45000 },
      cantidadStock: 10,
    });

    let capturedTotals: { subtotal: number } | null = null;
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        orderItem: { create: vi.fn().mockResolvedValue({ id: 'item-2' }) },
        order: {
          update: vi.fn().mockImplementation((args: any) => {
            capturedTotals = args.data;
            return { id: 'order-1' };
          }),
        },
        sale: { update: vi.fn().mockResolvedValue({}) },
        orderHistory: { create: vi.fn().mockResolvedValue({ id: 'hist-1' }) },
      };
      return cb(tx);
    });

    const useCase = new AddSaleItem(mockRepo);
    await useCase.execute('sale-1', {
      nombre: 'Pantalón',
      precio: 999999,
      cantidad: 1,
      productId: 'prod-2',
    });

    expect(capturedTotals).not.toBeNull();
    expect(capturedTotals!.subtotal).toBe(25000 * 2 + 45000 * 1);
  });

  it('should throw BadRequestError when product has no stock', async () => {
    const mockRepo = createMockSaleRepo();
    (mockRepo.findById as any).mockResolvedValue({
      id: 'sale-1',
      orderId: 'order-1',
      estado: 'COMPLETADA',
    });
    (prisma.order.findFirst as any).mockResolvedValue({
      id: 'order-1',
      estado: 'RECIBO_GENERATED',
      items: [{ id: 'item-1', nombre: 'Camiseta', precio: { toNumber: () => 25000 }, cantidad: 2 }],
    });
    (prisma.product.findUnique as any).mockResolvedValue({
      id: 'prod-2',
      nombre: 'Pantalón',
      precio: { toNumber: () => 45000 },
      cantidadStock: 0,
    });

    const useCase = new AddSaleItem(mockRepo);
    await expect(
      useCase.execute('sale-1', { nombre: 'Pantalón', precio: 45000, cantidad: 1, productId: 'prod-2' }),
    ).rejects.toThrow('stock disponible');
  });
});
