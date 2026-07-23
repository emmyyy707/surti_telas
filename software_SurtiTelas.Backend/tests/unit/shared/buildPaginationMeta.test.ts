import { describe, it, expect } from 'vitest';
import { buildPaginationMeta } from '@/shared/presentation/http/PaginatedResponse';

describe('buildPaginationMeta', () => {
  it('should build correct metadata for first page', () => {
    const meta = buildPaginationMeta(100, 1, 20);
    expect(meta.totalRecords).toBe(100);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(20);
    expect(meta.totalPages).toBe(5);
  });

  it('should handle single page', () => {
    const meta = buildPaginationMeta(10, 1, 50);
    expect(meta.totalRecords).toBe(10);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(50);
    expect(meta.totalPages).toBe(1);
  });

  it('should handle empty dataset', () => {
    const meta = buildPaginationMeta(0, 1, 20);
    expect(meta.totalRecords).toBe(0);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(20);
    expect(meta.totalPages).toBe(1);
  });

  it('should cap page to totalPages', () => {
    const meta = buildPaginationMeta(10, 5, 20);
    expect(meta.page).toBe(1);
    expect(meta.totalPages).toBe(1);
  });
});
