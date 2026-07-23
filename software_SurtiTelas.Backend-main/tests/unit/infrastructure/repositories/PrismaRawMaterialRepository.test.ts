import { describe, it, expect, vi } from 'vitest';
import { PrismaRawMaterialRepository } from '@/modules/stock/infrastructure/repositories/PrismaRawMaterialRepository';

const mockPrisma = {
  rawMaterial: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
} as any;

const repo = new PrismaRawMaterialRepository(mockPrisma as any);

describe('PrismaRawMaterialRepository', () => {
  const makeRow = (overrides = {}) => ({
    id: '1',
    nombre: 'Algodón',
    categoria: 'Tela',
    unidadMedida: 'm',
    stockActual: 100,
    stockMinimo: 20,
    proveedorId: null,
    precioUnitario: { toNumber: () => 5000 },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });

  it('should list raw materials', async () => {
    mockPrisma.$transaction.mockResolvedValue([
      [makeRow()],
      1,
    ]);

    const result = await repo.list();
    expect(result.data).toHaveLength(1);
  });

  it('should filter by necesitaReposicion', async () => {
    mockPrisma.$transaction.mockResolvedValue([
      [makeRow({ stockActual: 10 })],
      1,
    ]);

    const result = await repo.list({ necesitaReposicion: true });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].necesitaReposicion()).toBe(true);
  });

  it('should get by id', async () => {
    mockPrisma.rawMaterial.findFirst.mockResolvedValue(makeRow());

    const result = await repo.getById('1');
    expect(result?.nombre).toBe('Algodón');
  });

  it('should create raw material', async () => {
    mockPrisma.rawMaterial.create.mockResolvedValue(makeRow());

    const result = await repo.create({ nombre: 'Algodón', categoria: 'Tela', unidadMedida: 'm', precioUnitario: 5000 });
    expect(result.nombre).toBe('Algodón');
  });

  it('should update raw material', async () => {
    mockPrisma.rawMaterial.findFirst.mockResolvedValue(makeRow());
    mockPrisma.rawMaterial.update.mockResolvedValue(makeRow({ nombre: 'Algodón Updated' }));

    const result = await repo.update('1', { nombre: 'Algodón Updated' });
    expect(result.nombre).toBe('Algodón Updated');
  });

  it('should soft delete raw material', async () => {
    mockPrisma.rawMaterial.findFirst.mockResolvedValue(makeRow());
    mockPrisma.rawMaterial.update.mockResolvedValue({});

    await repo.delete('1');
    expect(mockPrisma.rawMaterial.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { deletedAt: expect.any(Date) } });
  });
});
