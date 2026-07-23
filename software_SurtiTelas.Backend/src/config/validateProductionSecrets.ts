export function validateProductionSecrets(env: {
  NODE_ENV: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
}): void {
  if (env.NODE_ENV !== 'production') return;

  const weakSecrets = new Set([
    'surtitelas',
    'surtitelas123',
    'changeme',
    'secret',
    'default',
    'password',
    '123456',
    'abcdefghijklmnop',
    'qwertyuiopasdfgh',
  ]);

  const validate = (name: string, value: string) => {
    const lower = value.toLowerCase();
    if (weakSecrets.has(lower) || lower.length < 32) {
      throw new Error(
        `Invalid ${name} in production: must be a strong secret (min 32 chars, not a known default)`
      );
    }
  };

  validate('JWT_ACCESS_SECRET', env.JWT_ACCESS_SECRET);
  validate('JWT_REFRESH_SECRET', env.JWT_REFRESH_SECRET);

  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different in production');
  }
}
