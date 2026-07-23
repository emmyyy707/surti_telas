import { describe, it, expect, vi } from 'vitest';
import { PrismaSupplierRepository } from '@/modules/stock/infrastructure/repositories/PrismaSupplierRepository';

const mockPrisma = {
  supplier: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
} as any;

const repo = new PrismaSupplierRepository(mockPrisma as any);

describe('PrismaSupplierRepository', () => {
  it('should list suppliers', async () => {
    mockPrisma.$transaction.mockResolvedValue([
      [{ id: '1', nombre: 'Proveedor Test', nit: '900123456-1', telefono: null, email: null, direccion: null, ciudad: null, materiales: [], estado: 'ACTIVO', calificacion: 0, pedidosRealizados: 0, ultimoPedido: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }],
      1,
    ]);

    const result = await repo.list();
    expect(result.data).toHaveLength(1);
  });

  it('should get supplier by id', async () => {
    mockPrisma.supplier.findFirst.mockResolvedValue({
      id: '1',
      nombre: 'Proveedor Test',
      nit: '900123456-1',
      telefono: null,
      email: null,
      direccion: null,
      ciudad: null,
      materiales: [],
      estado: 'ACTIVO',
      calificacion: 0,
      pedidosRealizados: 0,
      ultimoPedido: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await repo.getById('1');
    expect(result?.nombre).toBe('Proveedor Test');
  });

  it('should create supplier', async () => {
    mockPrisma.supplier.create.mockResolvedValue({
      id: '1',
      nombre: 'Proveedor Test',
      nit: '900123456-1',
      telefono: null,
      email: null,
      direccion: null,
      ciudad: null,
      materiales: [],
      estado: 'ACTIVO',
      calificacion: 0,
      pedidosRealizados: 0,
      ultimoPedido: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await repo.create({ nombre: 'Proveedor Test', nit: '900123456-1' });
    expect(result.nombre).toBe('Proveedor Test');
  });

  it('should update supplier', async () => {
    mockPrisma.supplier.findFirst.mockResolvedValue({
      id: '1',
      nombre: 'Proveedor Test',
      nit: '900123456-1',
      telefono: null,
      email: null,
      direccion: null,
      ciudad: null,
      materiales: [],
      estado: 'ACTIVO',
      calificacion: 0,
      pedidosRealizados: 0,
      ultimoPedido: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    mockPrisma.supplier.update.mockResolvedValue({
      id: '1',
      nombre: 'Proveedor Updated',
      nit: '900123456-1',
      telefono: null,
      email: null,
      direccion: null,
      ciudad: null,
      materiales: [],
      estado: 'ACTIVO',
      calificacion: 0,
      pedidosRealizados: 0,
      ultimoPedido: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await repo.update('1', { nombre: 'Proveedor Updated' });
    expect(result.nombre).toBe('Proveedor Updated');
  });

  it('should soft delete supplier', async () => {
    mockPrisma.supplier.findFirst.mockResolvedValue({
      id: '1',
      nombre: 'Proveedor Test',
      nit: '900123456-1',
      telefono: null,
      email: null,
      direccion: null,
      ciudad: null,
      materiales: [],
      estado: 'ACTIVO',
      calificacion: 0,
      pedidosRealizados: 0,
      ultimoPedido: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    mockPrisma.supplier.update.mockResolvedValue({});

    await repo.delete('1');
    expect(mockPrisma.supplier.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { deletedAt: expect.any(Date) } });
  });
});
