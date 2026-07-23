import { describe, it, expect } from 'vitest';
import { validateProductionSecrets } from '@/config/validateProductionSecrets';

describe('validateProductionSecrets', () => {
  it('should pass in non-production with weak secrets', () => {
    expect(() =>
      validateProductionSecrets({
        NODE_ENV: 'development',
        JWT_ACCESS_SECRET: 'short',
        JWT_REFRESH_SECRET: 'short',
      })
    ).not.toThrow();
  });

  it('should throw in production for short secrets', () => {
    expect(() =>
      validateProductionSecrets({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'short',
        JWT_REFRESH_SECRET: 'short',
      })
    ).toThrow('min 32 chars');
  });

  it('should throw in production for known weak secrets', () => {
    expect(() =>
      validateProductionSecrets({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'surtitelas123',
        JWT_REFRESH_SECRET: 'surtitelas123',
      })
    ).toThrow('known default');
  });

  it('should throw when JWT secrets are identical', () => {
    expect(() =>
      validateProductionSecrets({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'a'.repeat(32),
      })
    ).toThrow('must be different');
  });

  it('should pass in production with strong and different secrets', () => {
    expect(() =>
      validateProductionSecrets({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      })
    ).not.toThrow();
  });
});
