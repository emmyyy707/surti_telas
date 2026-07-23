import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '../../domain/services/PasswordHasher';

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly rounds = 12;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
