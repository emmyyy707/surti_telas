import { describe, it, expect } from 'vitest';
import { CreateCustomOrderItemSchema, CreateCustomOrderSchema, QuotationSchema, UpdateCustomOrderSchemaBase } from '@/modules/pedidos-personalizados/presentation/validators/custom-order.validators';

describe('Custom Order Validators', () => {
  describe('CreateCustomOrderItemSchema', () => {
    it('should accept valid item', () => {
      const result = CreateCustomOrderItemSchema.safeParse({
        descripcion: 'Camiseta',
        tipoPersonalizacion: 'BORDADO_ESTAMPADO',
        cantidad: 10,
        distribucionTallas: { S: 2, M: 3, L: 5 },
      });
      expect(result.success).toBe(true);
    });

    it('should reject item with quantity mismatch in distribucionTallas', () => {
      const result = CreateCustomOrderItemSchema.safeParse({
        descripcion: 'Camiseta',
        tipoPersonalizacion: 'BORDADO_ESTAMPADO',
        cantidad: 10,
        distribucionTallas: { S: 2, M: 3, L: 4 },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('distribución de tallas'))).toBe(true);
      }
    });

    it('should reject item with quantity mismatch in distribucionColores', () => {
      const result = CreateCustomOrderItemSchema.safeParse({
        descripcion: 'Camiseta',
        tipoPersonalizacion: 'BORDADO_ESTAMPADO',
        cantidad: 10,
        distribucionColores: { Rojo: 6, Azul: 3 },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('distribución de colores'))).toBe(true);
      }
    });
  });

  describe('CreateCustomOrderSchema', () => {
    it('should accept valid order', () => {
      const result = CreateCustomOrderSchema.safeParse({
        clienteNombre: 'Juan',
        clienteEmail: 'juan@example.com',
        items: [
          {
            descripcion: 'Camiseta',
            tipoPersonalizacion: 'BORDADO_ESTAMPADO',
            cantidad: 10,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should reject order with past fechaEntregaDeseada', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const result = CreateCustomOrderSchema.safeParse({
        clienteNombre: 'Juan',
        items: [
          {
            descripcion: 'Camiseta',
            tipoPersonalizacion: 'BORDADO_ESTAMPADO',
            cantidad: 10,
          },
        ],
        fechaEntregaDeseada: pastDate,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('futura'))).toBe(true);
      }
    });

    it('should accept empty email as valid', () => {
      const result = CreateCustomOrderSchema.safeParse({
        clienteNombre: 'Juan',
        clienteEmail: '',
        items: [
          {
            descripcion: 'Camiseta',
            tipoPersonalizacion: 'BORDADO_ESTAMPADO',
            cantidad: 10,
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('QuotationSchema', () => {
    it('should accept valid quotation', () => {
      const result = QuotationSchema.safeParse({
        subtotal: 100,
        detalles: [
          { tipo: 'PRODUCTO_BASE', descripcion: 'Camiseta', cantidad: 10, precioUnitario: 10, subtotal: 100 },
        ],
        validaHasta: new Date(Date.now() + 86400000).toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('should reject quotation with mismatched subtotal', () => {
      const result = QuotationSchema.safeParse({
        subtotal: 200,
        detalles: [
          { tipo: 'PRODUCTO_BASE', descripcion: 'Camiseta', cantidad: 10, precioUnitario: 10, subtotal: 100 },
        ],
        validaHasta: new Date(Date.now() + 86400000).toISOString(),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('subtotal'))).toBe(true);
      }
    });

    it('should reject quotation with past validaHasta', () => {
      const result = QuotationSchema.safeParse({
        subtotal: 100,
        detalles: [
          { tipo: 'PRODUCTO_BASE', descripcion: 'Camiseta', cantidad: 10, precioUnitario: 10, subtotal: 100 },
        ],
        validaHasta: new Date(Date.now() - 86400000).toISOString(),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('futura'))).toBe(true);
      }
    });
  });

  describe('UpdateCustomOrderSchemaBase', () => {
    it('should accept partial update', () => {
      const result = UpdateCustomOrderSchemaBase.safeParse({
        clienteNombre: 'Juan Actualizado',
        items: [
          {
            descripcion: 'Camiseta',
            tipoPersonalizacion: 'BORDADO_ESTAMPADO',
            cantidad: 5,
            distribucionTallas: { S: 2, M: 3 },
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });
});
