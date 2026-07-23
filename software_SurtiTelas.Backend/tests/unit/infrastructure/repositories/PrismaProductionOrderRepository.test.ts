import { describe, it, expect, vi } from 'vitest';
import { PrismaProductionOrderRepository } from '@/modules/production/infrastructure/repositories/PrismaProductionOrderRepository';
import { PrismaWorkshopRepository } from '@/modules/production/infrastructure/repositories/PrismaWorkshopRepository';
import { NotFoundError, BadRequestError } from '@/shared/domain/errors';

const mockPrisma = {
  productionOrder: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  workshop: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
} as any;

const prodRepo = new PrismaProductionOrderRepository(mockPrisma as any);
const workshopRepo = new PrismaWorkshopRepository(mockPrisma as any);

const makeOrderRow = (overrides = {}) => ({
  id: 'po-1',
  pedidoId: 'order-1',
  operarioId: 'op-1',
  tallerId: 'w-1',
  referencia: 'REF-001',
  cantidad: 100,
  fechaInicio: new Date('2026-01-01'),
  fechaEstimada: new Date('2026-01-10'),
  avance: 40,
  estado: 'EN_PROCESO',
  tela: 'Algodón',
  colores: ['Blanco'],
  curvaTallas: { s: 10 },
  notasTecnicas: 'Notas',
  ...overrides,
});

const makeWorkshopRow = (overrides = {}) => ({
  id: 'w-1',
  nombre: 'Taller Norte',
  encargadoId: 'op-1',
  direccion: 'Calle 1',
  ciudad: 'Bogotá',
  estado: 'ACTIVO',
  capacidad: 200,
  ...overrides,
});

describe('PrismaProductionOrderRepository', () => {
  it('lists production orders with pagination', async () => {
    mockPrisma.$transaction.mockResolvedValue([[makeOrderRow()], 1]);

    const result = await prodRepo.list({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 10 });
    expect(mockPrisma.productionOrder.findMany).toHaveBeenCalled();
  });

  it('applies estado/taller/operario/pedido filters', async () => {
    mockPrisma.$transaction.mockResolvedValue([[], 0]);

    await prodRepo.list({ estado: 'TERMINADO', tallerId: 'w-1', operarioId: 'op-1', pedidoId: 'order-1' });

    const where = mockPrisma.productionOrder.findMany.mock.calls.at(-1)![0].where;
    expect(where).toMatchObject({
      deletedAt: null,
      estado: 'TERMINADO',
      tallerId: 'w-1',
      operarioId: 'op-1',
      pedidoId: 'order-1',
    });
  });

  it('gets an order by id', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow());
    const order = await prodRepo.getById('po-1');
    expect(order?.referencia).toBe('REF-001');
  });

  it('returns null when order not found', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(null);
    expect(await prodRepo.getById('po-1')).toBeNull();
  });

  it('creates a production order with defaults', async () => {
    mockPrisma.productionOrder.create.mockResolvedValue(makeOrderRow());
    const order = await prodRepo.create({
      referencia: 'REF-001',
      cantidad: 100,
      fechaEstimada: new Date('2026-01-10'),
    });
    expect(order.referencia).toBe('REF-001');
    const data = mockPrisma.productionOrder.create.mock.calls[0][0].data;
    expect(data.estado).toBe('PENDIENTE');
    expect(data.avance).toBe(0);
  });

  it('updates an order', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow());
    mockPrisma.productionOrder.update.mockResolvedValue(makeOrderRow({ avance: 80 }));
    const order = await prodRepo.update('po-1', { avance: 80 });
    expect(order.avance).toBe(80);
  });

  it('throws NotFound when updating missing order', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(null);
    await expect(prodRepo.update('po-1', { avance: 80 })).rejects.toThrow(NotFoundError);
  });

  it('assigns to workshop', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow());
    mockPrisma.workshop.findFirst.mockResolvedValue(makeWorkshopRow());
    mockPrisma.productionOrder.update.mockResolvedValue(makeOrderRow({ tallerId: 'w-2' }));
    const order = await prodRepo.assignToWorkshop('po-1', 'w-2');
    expect(order.tallerId).toBe('w-2');
  });

  it('throws BadRequest when workshop is invalid on assign', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow());
    mockPrisma.workshop.findFirst.mockResolvedValue(null);
    await expect(prodRepo.assignToWorkshop('po-1', 'w-2')).rejects.toThrow(BadRequestError);
  });

  it('updates progress and recomputes estado', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow({ avance: 40 }));
    mockPrisma.productionOrder.update.mockResolvedValue(makeOrderRow({ avance: 100, estado: 'TERMINADO' }));
    const order = await prodRepo.updateProgress('po-1', 100);
    expect(order.avance).toBe(100);
    const data = mockPrisma.productionOrder.update.mock.calls.at(-1)![0].data;
    expect(data.estado).toBe('TERMINADO');
  });

  it('throws BadRequest when progress is out of range', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow({ avance: 40 }));
    await expect(prodRepo.updateProgress('po-1', 150)).rejects.toThrow(BadRequestError);
  });

  it('completes an order at 100% progress', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow({ avance: 100 }));
    mockPrisma.productionOrder.update.mockResolvedValue(makeOrderRow({ avance: 100, estado: 'TERMINADO' }));
    const order = await prodRepo.complete('po-1');
    expect(order.estado).toBe('TERMINADO');
  });

  it('throws BadRequest when completing without 100% progress', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow({ avance: 40 }));
    await expect(prodRepo.complete('po-1')).rejects.toThrow(BadRequestError);
  });

  it('soft deletes an order', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(makeOrderRow());
    mockPrisma.productionOrder.update.mockResolvedValue({});
    await prodRepo.delete('po-1');
    expect(mockPrisma.productionOrder.update).toHaveBeenCalledWith({
      where: { id: 'po-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws NotFound when deleting missing order', async () => {
    mockPrisma.productionOrder.findFirst.mockResolvedValue(null);
    await expect(prodRepo.delete('po-1')).rejects.toThrow(NotFoundError);
  });
});

describe('PrismaWorkshopRepository', () => {
  it('lists workshops with pagination', async () => {
    mockPrisma.$transaction.mockResolvedValue([[makeWorkshopRow()], 1]);
    const result = await workshopRepo.list({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 10 });
  });

  it('applies search and estado filters', async () => {
    mockPrisma.$transaction.mockResolvedValue([[], 0]);
    await workshopRepo.list({ search: 'Norte', estado: 'ACTIVO' });
    const where = mockPrisma.workshop.findMany.mock.calls.at(-1)![0].where;
    expect(where.estado).toBe('ACTIVO');
    expect(where.OR).toEqual([
      { nombre: { contains: 'Norte', mode: 'insensitive' } },
      { ciudad: { contains: 'Norte', mode: 'insensitive' } },
    ]);
  });

  it('gets a workshop by id', async () => {
    mockPrisma.workshop.findFirst.mockResolvedValue(makeWorkshopRow());
    const workshop = await workshopRepo.getById('w-1');
    expect(workshop?.nombre).toBe('Taller Norte');
  });

  it('creates a workshop with default estado', async () => {
    mockPrisma.workshop.create.mockResolvedValue(makeWorkshopRow());
    await workshopRepo.create({ nombre: 'Taller Norte' });
    const data = mockPrisma.workshop.create.mock.calls[0][0].data;
    expect(data.estado).toBe('ACTIVO');
  });

  it('updates a workshop', async () => {
    mockPrisma.workshop.findFirst.mockResolvedValue(makeWorkshopRow());
    mockPrisma.workshop.update.mockResolvedValue(makeWorkshopRow({ nombre: 'Taller Sur' }));
    const workshop = await workshopRepo.update('w-1', { nombre: 'Taller Sur' });
    expect(workshop.nombre).toBe('Taller Sur');
  });

  it('throws NotFound when updating missing workshop', async () => {
    mockPrisma.workshop.findFirst.mockResolvedValue(null);
    await expect(workshopRepo.update('w-1', { nombre: 'x' })).rejects.toThrow(NotFoundError);
  });

  it('soft deletes a workshop', async () => {
    mockPrisma.workshop.findFirst.mockResolvedValue(makeWorkshopRow());
    mockPrisma.workshop.update.mockResolvedValue({});
    await workshopRepo.delete('w-1');
    expect(mockPrisma.workshop.update).toHaveBeenCalledWith({
      where: { id: 'w-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
