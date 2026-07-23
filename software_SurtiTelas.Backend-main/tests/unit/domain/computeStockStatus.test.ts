import { describe, it, expect } from 'vitest';
import { computeStockStatus } from '@/modules/catalog/domain/entities/Product';

describe('computeStockStatus edge cases', () => {
  it('should handle large stock numbers', () => {
    expect(computeStockStatus(10000)).toBe('OK');
  });

  it('should handle exactly 0', () => {
    expect(computeStockStatus(0)).toBe('Agotado');
  });

  it('should handle exactly 9 (below minimum)', () => {
    expect(computeStockStatus(9)).toBe('Bajo stock');
  });

  it('should handle exactly 10 (minimum for OK)', () => {
    expect(computeStockStatus(10)).toBe('OK');
  });
});
