import { describe, it, expect, vi } from 'vitest';
import { PrismaCategoryRepository } from '@/modules/catalog/infrastructure/repositories/prismaCategoryRepository';

const mockPrisma = {
  category: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
} as any;

const repo = new PrismaCategoryRepository(mockPrisma as any);

const row = (overrides = {}) => ({
  id: 'c-1',
  nombre: 'Camisetas',
  slug: 'camisetas',
  parentId: null,
  ...overrides,
});

describe('PrismaCategoryRepository', () => {
  it('lists categories ordered by nombre', async () => {
    mockPrisma.$transaction.mockResolvedValue([[row()], 1]);
    const result = await repo.list();
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({ id: 'c-1', nombre: 'Camisetas', slug: 'camisetas', parentId: null });
    expect(result.meta.total).toBe(1);
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({ orderBy: { nombre: 'asc' }, skip: 0, take: 50 });
  });

  it('creates a category', async () => {
    mockPrisma.category.create.mockResolvedValue(row({ parentId: 'c-0' }));
    const result = await repo.create({ nombre: 'Camisetas', slug: 'camisetas', parentId: 'c-0' });
    expect(result.nombre).toBe('Camisetas');
    expect(result.parentId).toBe('c-0');
    expect(mockPrisma.category.create.mock.calls.at(-1)![0].data).toMatchObject({
      nombre: 'Camisetas',
      slug: 'camisetas',
      parentId: 'c-0',
    });
  });

  it('finds a category by slug', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(row());
    const result = await repo.findBySlug('camisetas');
    expect(result?.slug).toBe('camisetas');
    expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({ where: { slug: 'camisetas' } });
  });

  it('returns null when slug not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    expect(await repo.findBySlug('nope')).toBeNull();
  });
});
