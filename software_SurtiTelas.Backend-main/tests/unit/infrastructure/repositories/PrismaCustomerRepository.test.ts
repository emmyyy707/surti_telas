import { describe, it, expect, vi } from 'vitest';
import { PrismaCustomerRepository } from '@/modules/customers/infrastructure/repositories/PrismaCustomerRepository';

const mockPrisma = {
  customer: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
} as any;

const repo = new PrismaCustomerRepository(mockPrisma as any);

describe('PrismaCustomerRepository', () => {
  const makeRow = (overrides = {}) => ({
    id: '1',
    nombre: 'Juan',
    ciudad: 'Bogotá',
    telefono: '300',
    asesorId: null,
    nit: '900',
    cupoTotal: { toNumber: () => 100000 },
    cupoUsado: { toNumber: () => 0 },
    deudaVencida: { toNumber: () => 0 },
    isTrustedCustomer: false,
    estado: 'ACTIVO',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    asesor: null,
    _count: { orders: 0 },
    ...overrides,
  });

  it('should list customers', async () => {
    mockPrisma.$transaction.mockResolvedValue([
      [makeRow()],
      1,
    ]);

    const result = await repo.list();
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should get customer by id', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue(makeRow());

    const result = await repo.getById('1');
    expect(result?.nombre).toBe('Juan');
  });

  it('should create customer', async () => {
    mockPrisma.customer.create.mockResolvedValue(makeRow());

    const result = await repo.create({ nombre: 'Juan', ciudad: 'Bogotá', tel: '300', nit: '900', cupoTotal: 100000, estado: 'Activo' });
    expect(result.nombre).toBe('Juan');
  });

  it('should update customer', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue(makeRow());
    mockPrisma.customer.update.mockResolvedValue(makeRow({ nombre: 'Juan Updated' }));

    const result = await repo.update('1', { nombre: 'Juan Updated' });
    expect(result.nombre).toBe('Juan Updated');
  });

  it('should assign asesor', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue(makeRow({ asesorId: 'asesor1', asesor: { nombre: 'Asesor' } }));
    mockPrisma.customer.update.mockResolvedValue(makeRow({ asesorId: 'asesor1', asesor: { nombre: 'Asesor' } }));

    const result = await repo.assignAsesor('1', 'asesor1');
    expect(result.asesor).toBe('Asesor');
  });

  it('should update cupo', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue(makeRow());
    mockPrisma.customer.update.mockResolvedValue(makeRow({ cupoUsado: { toNumber: () => 50000 } }));

    const result = await repo.updateCupo('1', 50000);
    expect(result.cupoUsado).toBe(50000);
  });
});
