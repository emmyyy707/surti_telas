import { describe, it, expect, vi } from 'vitest';
import { EnableTwoFactor } from '@/modules/auth/application/use-cases/EnableTwoFactor';
import { VerifyTwoFactor } from '@/modules/auth/application/use-cases/VerifyTwoFactor';
import { DisableTwoFactor } from '@/modules/auth/application/use-cases/DisableTwoFactor';
import { UnauthorizedError } from '@/shared/domain/errors';

vi.mock('otplib', () => ({
  generateSecret: vi.fn(() => 'mock-secret'),
  generateURI: vi.fn(() => 'otpauth://mock'),
  verify: vi.fn(() => true),
}));

const mockRepo = {
  updateTwoFactorSecret: vi.fn(),
  enableTwoFactor: vi.fn(),
  findById: vi.fn(),
  updateRefreshToken: vi.fn(),
};

const mockTokens = {
  signTempToken: vi.fn(),
  verifyTempToken: vi.fn(),
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
};

describe('EnableTwoFactor', () => {
  it('should generate secret and otpauthUrl', async () => {
    const useCase = new EnableTwoFactor(mockRepo as any);
    mockRepo.updateTwoFactorSecret.mockResolvedValue(undefined);
    mockRepo.enableTwoFactor.mockResolvedValue(undefined);

    const result = await useCase.execute('user-1');

    expect(mockRepo.updateTwoFactorSecret).toHaveBeenCalledWith('user-1', expect.any(String));
    expect(mockRepo.enableTwoFactor).toHaveBeenCalledWith('user-1', true);
    expect(result.secret).toBeDefined();
    expect(result.otpauthUrl).toContain('otpauth://');
  });
});

describe('VerifyTwoFactor', () => {
  it('should return tokens when code is valid', async () => {
    const useCase = new VerifyTwoFactor(mockRepo as any, mockTokens as any);
    mockTokens.verifyTempToken.mockReturnValue({ id: 'user-1', email: 'test@test.com', nombre: 'Test', role: 'ADMIN', permissions: [] });
    mockRepo.findById.mockResolvedValue({
      id: 'user-1',
      twoFactorSecret: 'secret',
      twoFactorEnabled: true,
    });
    mockTokens.signAccessToken.mockReturnValue('access-token');
    mockTokens.signRefreshToken.mockReturnValue('refresh-token');
    mockRepo.updateRefreshToken.mockResolvedValue('hashed-refresh');

    const result = await useCase.execute({ tempToken: 'temp-token', code: '123456' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.id).toBe('user-1');
  });

  it('should throw when 2FA is not enabled', async () => {
    const useCase = new VerifyTwoFactor(mockRepo as any, mockTokens as any);
    mockTokens.verifyTempToken.mockReturnValue({ id: 'user-1', email: 'test@test.com', nombre: 'Test', role: 'ADMIN', permissions: [] });
    mockRepo.findById.mockResolvedValue({
      id: 'user-1',
      twoFactorSecret: null,
      twoFactorEnabled: false,
    });

    await expect(useCase.execute({ tempToken: 'temp-token', code: '123456' })).rejects.toThrow(UnauthorizedError);
  });

  it('should throw when code is invalid', async () => {
    const { verify } = await import('otplib');
    (verify as any).mockReturnValue(false);

    const useCase = new VerifyTwoFactor(mockRepo as any, mockTokens as any);
    mockTokens.verifyTempToken.mockReturnValue({ id: 'user-1', email: 'test@test.com', nombre: 'Test', role: 'ADMIN', permissions: [] });
    mockRepo.findById.mockResolvedValue({
      id: 'user-1',
      twoFactorSecret: 'secret',
      twoFactorEnabled: true,
    });

    await expect(useCase.execute({ tempToken: 'temp-token', code: '000000' })).rejects.toThrow(UnauthorizedError);
  });
});

describe('DisableTwoFactor', () => {
  it('should disable 2FA and clear secret', async () => {
    const useCase = new DisableTwoFactor(mockRepo as any);
    mockRepo.updateTwoFactorSecret.mockResolvedValue(undefined);
    mockRepo.enableTwoFactor.mockResolvedValue(undefined);

    await useCase.execute('user-1');

    expect(mockRepo.updateTwoFactorSecret).toHaveBeenCalledWith('user-1', null);
    expect(mockRepo.enableTwoFactor).toHaveBeenCalledWith('user-1', false);
  });
});
