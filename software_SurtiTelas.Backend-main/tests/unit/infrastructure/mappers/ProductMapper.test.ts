import { describe, it, expect } from 'vitest';
import {
  toProductData,
  toCreateInput,
  toUpdateInput,
} from '@/modules/catalog/infrastructure/mappers/ProductMapper';
import { Product } from '@/modules/catalog/domain/entities/Product';

const dec = (n: number) => ({ toNumber: () => n });

const row = {
  id: 'prod-1',
  ref: 'REF-001',
  codigo: 'C-001',
  nombre: 'Camiseta',
  descripcion: 'Algodón',
  descripcionCorta: 'Cam',
  categoriaId: 'cat-1',
  categoria: { nombre: 'Camisetas' },
  subcategoria: 'Manga corta',
  marca: 'Surti',
  precio: dec(1000),
  precioAnterior: dec(1500),
  descuento: 10,
  cantidadStock: 5,
  stockStatus: 'BAJO_STOCK' as const,
  estado: 'ACTIVO' as const,
  publicado: true,
  fechaPublicacion: null,
  destacado: true,
  oferta: false,
  nuevo: true,
  masVendido: false,
  tela: 'Algodón',
  colores: ['Blanco'],
  tallas: ['M'],
  imagenPrincipal: 'img.png',
  imagenes: ['img.png'],
};

describe('ProductMapper.toProductData', () => {
  it('maps a DB row into ProductData with derived category/stock/status', () => {
    const data = toProductData(row);
    expect(data).toMatchObject({
      id: 'prod-1',
      ref: 'REF-001',
      codigo: 'C-001',
      nombre: 'Camiseta',
      descripcion: 'Algodón',
      descripcionCorta: 'Cam',
      categoria: 'Camisetas',
      subcategoria: 'Manga corta',
      marca: 'Surti',
      precio: 1000,
      precioAnterior: 1500,
      descuento: 10,
      cantidadStock: 5,
      stock: 'Bajo stock',
      estado: 'Activo',
      publicado: true,
      destacado: true,
      oferta: false,
      nuevo: true,
      masVendido: false,
      tela: 'Algodón',
      colores: ['Blanco'],
      tallas: ['M'],
      imagenPrincipal: 'img.png',
      imagenes: ['img.png'],
    });
  });

  it('falls back to empty category when none is present', () => {
    const data = toProductData({ ...row, categoria: null });
    expect(data.categoria).toBe('');
  });

  it('returns undefined for nullable fields', () => {
    const data = toProductData({
      ...row,
      codigo: null,
      descripcion: null,
      descripcionCorta: null,
      subcategoria: null,
      marca: null,
      precioAnterior: null,
      imagenPrincipal: null,
    });
    expect(data.codigo).toBeUndefined();
    expect(data.descripcion).toBeUndefined();
    expect(data.precioAnterior).toBeUndefined();
    expect(data.imagenPrincipal).toBeUndefined();
  });
});

describe('ProductMapper.toCreateInput', () => {
  it('maps a valid Product into Prisma create input', () => {
    const product = new Product({
      ref: 'REF-001',
      nombre: 'Camiseta',
      categoria: 'Camisetas',
      precio: 1000,
      cantidadStock: 5,
      stock: 'Bajo stock',
      publicado: true,
      tela: 'Algodón',
      colores: ['Blanco'],
      tallas: ['M'],
      imagenes: [],
    });
    const input = toCreateInput(product, 'cat-1', 'REF-001');
    expect(input).toMatchObject({
      ref: 'REF-001',
      categoriaId: 'cat-1',
      nombre: 'Camiseta',
      precio: 1000,
      cantidadStock: 5,
      stockStatus: 'BAJO_STOCK',
      estado: 'ACTIVO',
      publicado: true,
      tela: 'Algodón',
    });
    expect(input.colores).toEqual(['Blanco']);
  });

  it('defaults stock/status when not provided', () => {
    const product = new Product({
      ref: 'REF-002',
      nombre: 'Pantalón',
      categoria: 'Pantalones',
      precio: 2000,
      cantidadStock: 20,
      stock: 'OK',
      publicado: false,
      tela: 'Mezclilla',
      colores: ['Azul'],
      tallas: ['L'],
      imagenes: [],
    });
    const input = toCreateInput(product, null, 'REF-002');
    expect(input.estado).toBe('ACTIVO');
    expect(input.stockStatus).toBe('OK');
    expect(input.categoriaId).toBeNull();
  });
});

describe('ProductMapper.toUpdateInput', () => {
  it('only includes defined changes', () => {
    const data = toUpdateInput({ nombre: 'Nuevo', precio: 900 });
    expect(data).toEqual({ nombre: 'Nuevo', precio: 900 });
  });

  it('derives stockStatus from explicit stock change', () => {
    const data = toUpdateInput({ stock: 'Agotado' });
    expect(data).toEqual({ stockStatus: 'AGOTADO' });
  });

  it('derives stockStatus from cantidadStock change', () => {
    expect(toUpdateInput({ cantidadStock: 0 }).stockStatus).toBe('AGOTADO');
    expect(toUpdateInput({ cantidadStock: 5 }).stockStatus).toBe('BAJO_STOCK');
    expect(toUpdateInput({ cantidadStock: 50 }).stockStatus).toBe('OK');
  });

  it('prefers explicit stock over derived when both provided', () => {
    const data = toUpdateInput({ cantidadStock: 0, stock: 'OK' });
    expect(data.stockStatus).toBe('OK');
  });

  it('maps estado and categoriaId changes', () => {
    const data = toUpdateInput({ estado: 'Inactivo', categoriaId: 'cat-9' });
    expect(data).toEqual({ estado: 'INACTIVO', categoriaId: 'cat-9' });
  });
});
