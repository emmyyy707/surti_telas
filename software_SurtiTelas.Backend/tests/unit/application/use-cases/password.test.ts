import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForgotPassword } from '@/modules/auth/application/use-cases/ForgotPassword';
import { ResetPassword } from '@/modules/auth/application/use-cases/ResetPassword';
import { ChangePassword } from '@/modules/auth/application/use-cases/ChangePassword';
import { NotFoundError, UnauthorizedError } from '@/shared/domain/errors';

const mockRepo = {
  findByEmail: vi.fn(),
  setResetPasswordToken: vi.fn(),
  findById: vi.fn(),
  findByResetPasswordToken: vi.fn(),
  clearResetPasswordToken: vi.fn(),
  updatePassword: vi.fn(),
};

const mockEmailService = {
  sendPasswordReset: vi.fn(),
};

const mockHasher = {
  hash: vi.fn(),
  compare: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ForgotPassword', () => {
  it('should set reset token for existing active user', async () => {
    const useCase = new ForgotPassword(mockRepo as any, mockEmailService as any);
    mockRepo.findByEmail.mockResolvedValue({ id: 'user-1', estado: 'ACTIVO' });
    mockRepo.setResetPasswordToken.mockResolvedValue(undefined);
    mockEmailService.sendPasswordReset.mockResolvedValue({ previewUrl: undefined });

    const result = await useCase.execute('test@test.com');

    expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@test.com');
    expect(mockRepo.setResetPasswordToken).toHaveBeenCalledWith('user-1', expect.any(String), expect.any(Date));
    expect(mockEmailService.sendPasswordReset).toHaveBeenCalledWith('test@test.com', expect.any(String));
    expect(result.message).toContain('Si el correo existe');
    expect(result.resetUrl).toBeDefined();
  });

  it('should return generic message for non-existing user', async () => {
    const useCase = new ForgotPassword(mockRepo as any);
    mockRepo.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute('nonexistent@test.com');

    expect(mockRepo.setResetPasswordToken).not.toHaveBeenCalled();
    expect(result.message).toContain('Si el correo existe');
  });
});

describe('ResetPassword', () => {
  it('should reset password with valid token', async () => {
    const useCase = new ResetPassword(mockRepo as any, mockHasher as any);
    mockRepo.findByResetPasswordToken.mockResolvedValue({ id: 'user-1', resetPasswordExpires: new Date(Date.now() + 3600000) });
    mockHasher.hash.mockResolvedValue('hashed-password');
    mockRepo.updatePassword.mockResolvedValue(undefined);
    mockRepo.clearResetPasswordToken.mockResolvedValue(undefined);

    await useCase.execute('valid-token', 'NewPass123!');

    expect(mockHasher.hash).toHaveBeenCalledWith('NewPass123!');
    expect(mockRepo.updatePassword).toHaveBeenCalledWith('user-1', 'hashed-password');
    expect(mockRepo.clearResetPasswordToken).toHaveBeenCalledWith('user-1');
  });

  it('should throw for invalid or expired token', async () => {
    const useCase = new ResetPassword(mockRepo as any, mockHasher as any);
    mockRepo.findByResetPasswordToken.mockResolvedValue(null);

    await expect(useCase.execute('invalid-token', 'NewPass123!')).rejects.toThrow(NotFoundError);
  });

  it('should throw for expired token', async () => {
    const useCase = new ResetPassword(mockRepo as any, mockHasher as any);
    mockRepo.findByResetPasswordToken.mockResolvedValue({ id: 'user-1', resetPasswordExpires: new Date(Date.now() - 3600000) });

    await expect(useCase.execute('expired-token', 'NewPass123!')).rejects.toThrow(NotFoundError);
  });
});

describe('ChangePassword', () => {
  it('should change password with correct current password', async () => {
    const useCase = new ChangePassword(mockRepo as any, mockHasher as any);
    mockRepo.findById.mockResolvedValue({ id: 'user-1', passwordHash: 'old-hash' });
    mockHasher.compare.mockResolvedValue(true);
    mockHasher.hash.mockResolvedValue('new-hash');
    mockRepo.updatePassword.mockResolvedValue(undefined);

    await useCase.execute('user-1', 'OldPass123!', 'NewPass123!');

    expect(mockHasher.compare).toHaveBeenCalledWith('OldPass123!', 'old-hash');
    expect(mockHasher.hash).toHaveBeenCalledWith('NewPass123!');
    expect(mockRepo.updatePassword).toHaveBeenCalledWith('user-1', 'new-hash');
  });

  it('should throw for incorrect current password', async () => {
    const useCase = new ChangePassword(mockRepo as any, mockHasher as any);
    mockRepo.findById.mockResolvedValue({ id: 'user-1', passwordHash: 'old-hash' });
    mockHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute('user-1', 'WrongPass123!', 'NewPass123!')).rejects.toThrow(UnauthorizedError);
  });

  it('should throw for non-existing user', async () => {
    const useCase = new ChangePassword(mockRepo as any, mockHasher as any);
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', 'OldPass123!', 'NewPass123!')).rejects.toThrow(UnauthorizedError);
  });
});
