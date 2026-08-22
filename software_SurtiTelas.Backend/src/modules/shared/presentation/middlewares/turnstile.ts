import { Request, Response, NextFunction } from 'express';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function turnstileMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const token = (req.body?.turnstileToken as string | undefined)?.trim();

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'bad_request',
      message: 'Verificación de seguridad requerida.',
    });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Configuración de verificación no disponible.',
    });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', req.ip || '');

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = (await response.json()) as { success: boolean; challenge_ts?: string; hostname?: string; error?: string };

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'verification_failed',
        message: 'Verificación de seguridad fallida. Intenta nuevamente.',
      });
    }

    next();
  } catch {
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Error al verificar la seguridad. Intenta nuevamente.',
    });
  }
}
