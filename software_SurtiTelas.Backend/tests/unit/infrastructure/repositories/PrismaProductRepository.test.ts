import { describe, it, expect, vi } from 'vitest';
import { PrismaProductRepository } from '@/modules/catalog/infrastructure/repositories/PrismaProductRepository';
import { Product } from '@/modules/catalog/domain/entities/Product';

const mockPrisma = {
  product: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  category: { findFirst: vi.fn() },
  $transaction: vi.fn(),
} as any;

const repo = new PrismaProductRepository(mockPrisma as any);

describe('PrismaProductRepository', () => {
  const makeRow = (overrides = {}) => ({
    id: '1',
    ref: 'REF-001',
    nombre: 'Camiseta',
    descripcion: null,
    descripcionCorta: null,
    categoriaId: null,
    categoria: { nombre: 'Camisetas' },
    subcategoria: null,
    marca: null,
    precio: { toNumber: () => 25000 },
    precioAnterior: { toNumber: () => 30000 },
    descuento: 0,
    cantidadStock: 100,
    stockStatus: 'OK',
    estado: 'ACTIVO',
    publicado: true,
    fechaPublicacion: null,
    destacado: false,
    oferta: false,
    nuevo: false,
    masVendido: false,
    tela: 'Algodón',
    colores: ['Blanco'],
    tallas: ['M'],
    imagenPrincipal: null,
    imagenes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });

  it('should list products', async () => {
    mockPrisma.$transaction.mockResolvedValue([
      [makeRow()],
      1,
    ]);

    const result = await repo.list();
    expect(result.data).toHaveLength(1);
  });

  it('should get product by id', async () => {
    mockPrisma.product.findFirst.mockResolvedValue(makeRow());

    const result = await repo.getById('1');
    expect(result?.ref).toBe('REF-001');
  });

  it('should create product', async () => {
    mockPrisma.category.findFirst.mockResolvedValue({ id: 'cat1', nombre: 'Camisetas', slug: 'camisetas' });
    mockPrisma.product.create.mockResolvedValue(makeRow());

    const product = new Product({
      id: '1',
      ref: 'REF-001',
      nombre: 'Camiseta',
      precio: 25000,
      cantidadStock: 100,
      stock: 'OK',
      estado: 'Activo',
      categoria: 'Camisetas',
      tela: 'Algodón',
      colores: ['Blanco'],
      tallas: ['M'],
      imagenes: [],
      publicado: true,
      fecha: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const result = await repo.create(product);
    expect(result.ref).toBe('REF-001');
  });

  it('should update product', async () => {
    mockPrisma.product.findFirst.mockResolvedValue(makeRow());
    mockPrisma.product.update.mockResolvedValue(makeRow({ nombre: 'Camiseta Updated' }));

    const result = await repo.update('REF-001', { nombre: 'Camiseta Updated' });
    expect(result.nombre).toBe('Camiseta Updated');
  });

  it('should soft delete product', async () => {
    mockPrisma.product.findFirst.mockResolvedValue(makeRow());
    mockPrisma.product.update.mockResolvedValue({});

    await repo.delete('REF-001');
    expect(mockPrisma.product.update).toHaveBeenCalledWith({ where: { ref: 'REF-001' }, data: { deletedAt: expect.any(Date) } });
  });
});
