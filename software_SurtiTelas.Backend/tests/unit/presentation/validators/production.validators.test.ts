import { describe, it, expect } from 'vitest';
import { AssignToWorkshopSchema, UpdateProgressSchema, CompleteProductionSchema } from '@/modules/production/presentation/validators/production.validators';

describe('production.validators', () => {
  describe('AssignToWorkshopSchema', () => {
    it('should accept valid tallerId', () => {
      const result = AssignToWorkshopSchema.parse({ tallerId: 'taller-1' });
      expect(result.tallerId).toBe('taller-1');
    });

  it('should reject missing tallerId', () => {
    expect(() => AssignToWorkshopSchema.parse({})).toThrow();
  });

  it('should reject empty tallerId', () => {
    expect(() => AssignToWorkshopSchema.parse({ tallerId: '' })).toThrow('El taller es obligatorio');
  });
  });

  describe('UpdateProgressSchema', () => {
    it('should accept valid avance', () => {
      const result = UpdateProgressSchema.parse({ avance: 50 });
      expect(result.avance).toBe(50);
    });

    it('should accept avance 0', () => {
      const result = UpdateProgressSchema.parse({ avance: 0 });
      expect(result.avance).toBe(0);
    });

    it('should accept avance 100', () => {
      const result = UpdateProgressSchema.parse({ avance: 100 });
      expect(result.avance).toBe(100);
    });

    it('should reject avance > 100', () => {
      expect(() => UpdateProgressSchema.parse({ avance: 101 })).toThrow('El avance máximo es 100');
    });

    it('should reject avance < 0', () => {
      expect(() => UpdateProgressSchema.parse({ avance: -1 })).toThrow('El avance mínimo es 0');
    });

    it('should reject missing avance', () => {
      expect(() => UpdateProgressSchema.parse({})).toThrow();
    });

    it('should reject decimal avance', () => {
      expect(() => UpdateProgressSchema.parse({ avance: 50.5 })).toThrow();
    });
  });

  describe('CompleteProductionSchema', () => {
    it('should accept empty body', () => {
      const result = CompleteProductionSchema.parse({});
      expect(result).toEqual({});
    });
  });
});
