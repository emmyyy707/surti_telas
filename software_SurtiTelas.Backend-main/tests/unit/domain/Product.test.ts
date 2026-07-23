import { describe, it, expect } from 'vitest';
import { Product, computeStockStatus } from '@/modules/catalog/domain/entities/Product';

describe('Product', () => {
  it('should create a valid product', () => {
    const product = new Product({
      ref: 'REF-001',
      nombre: 'Camiseta básica',
      categoria: 'Camisetas',
      precio: 25000,
      cantidadStock: 120,
      stock: 'OK',
      publicado: true,
      tela: 'Algodón',
      colores: ['Blanco', 'Negro'],
      tallas: ['S', 'M', 'L'],
      imagenes: [],
    });

    expect(product.ref).toBe('REF-001');
    expect(product.nombre).toBe('Camiseta básica');
    expect(product.precio).toBe(25000);
    expect(product.cantidadStock).toBe(120);
    expect(product.publicado).toBe(true);
  });

  it('should throw error if ref is empty', () => {
    expect(() => {
      new Product({
        ref: '',
        nombre: 'Test',
        categoria: 'Test',
        precio: 1000,
        cantidadStock: 10,
        stock: 'OK',
        publicado: false,
        tela: 'Test',
        colores: ['Rojo'],
        tallas: ['M'],
        imagenes: [],
      });
    }).toThrow('El producto debe tener una referencia');
  });

  it('should throw error if nombre is empty', () => {
    expect(() => {
      new Product({
        ref: 'REF-001',
        nombre: '',
        categoria: 'Test',
        precio: 1000,
        cantidadStock: 10,
        stock: 'OK',
        publicado: false,
        tela: 'Test',
        colores: ['Rojo'],
        tallas: ['M'],
        imagenes: [],
      });
    }).toThrow('El producto debe tener un nombre');
  });

  it('should publish product when valid', () => {
    const product = new Product({
      ref: 'REF-001',
      nombre: 'Camiseta básica',
      categoria: 'Camisetas',
      precio: 25000,
      cantidadStock: 120,
      stock: 'OK',
      publicado: false,
      imagenPrincipal: 'image.jpg',
      tela: 'Algodón',
      colores: ['Blanco'],
      tallas: ['M'],
      imagenes: [],
    });

    const published = product.publish();
    expect(published.publicado).toBe(true);
    expect(published.estado).toBe('Activo');
  });

  it('should unpublish product', () => {
    const product = new Product({
      ref: 'REF-001',
      nombre: 'Camiseta básica',
      categoria: 'Camisetas',
      precio: 25000,
      cantidadStock: 120,
      stock: 'OK',
      publicado: true,
      tela: 'Algodón',
      colores: ['Blanco'],
      tallas: ['M'],
      imagenes: [],
    });

    const unpublished = product.unpublish();
    expect(unpublished.publicado).toBe(false);
    expect(unpublished.estado).toBe('Inactivo');
  });

  it('should be available when published and not out of stock', () => {
    const product = new Product({
      ref: 'REF-001',
      nombre: 'Camiseta básica',
      categoria: 'Camisetas',
      precio: 25000,
      cantidadStock: 120,
      stock: 'OK',
      publicado: true,
      tela: 'Algodón',
      colores: ['Blanco'],
      tallas: ['M'],
      imagenes: [],
    });

    expect(product.isAvailable()).toBe(true);
  });
});

describe('computeStockStatus', () => {
  it('should return Agotado when stock is 0', () => {
    expect(computeStockStatus(0)).toBe('Agotado');
  });

  it('should return Bajo stock when stock is below 10', () => {
    expect(computeStockStatus(5)).toBe('Bajo stock');
  });

  it('should return OK when stock is 10 or more', () => {
    expect(computeStockStatus(10)).toBe('OK');
    expect(computeStockStatus(100)).toBe('OK');
  });
});
