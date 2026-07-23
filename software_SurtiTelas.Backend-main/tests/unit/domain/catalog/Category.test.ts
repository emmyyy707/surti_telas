import { describe, it, expect } from 'vitest';
import { Category } from '@/modules/catalog/domain/entities/Category';

describe('Category', () => {
  it('should create a valid category', () => {
    const category = new Category({ nombre: 'Camisetas', slug: 'camisetas' });
    expect(category.nombre).toBe('Camisetas');
    expect(category.slug).toBe('camisetas');
  });

  it('should create category with parent', () => {
    const category = new Category({ nombre: 'Manga Corta', slug: 'manga-corta', parentId: '1' });
    expect(category.parentId).toBe('1');
  });

  it('should throw if nombre is empty', () => {
    expect(() => new Category({ nombre: '   ', slug: 'test' })).toThrow('La categoría debe tener un nombre');
  });

  it('should throw if slug is empty', () => {
    expect(() => new Category({ nombre: 'Test', slug: '   ' })).toThrow('La categoría debe tener un slug');
  });
});
