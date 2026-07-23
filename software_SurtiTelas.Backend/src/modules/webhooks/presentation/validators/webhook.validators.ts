import { z } from 'zod';

const isPrivateOrLinkLocal = (value: string): boolean => {
  try {
    const url = new URL(value);
    const hostname = url.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') {
      return true;
    }

    if (hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.localhost')) {
      return true;
    }

    const parts = hostname.split('.');
    if (parts[0] === '10' || (parts[0] === '172' && parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31) || (parts[0] === '192' && parts[1] === '168')) {
      return true;
    }

    if (hostname.startsWith('169.254.') || hostname.startsWith('100.') || hostname.startsWith('198.18.') || hostname.startsWith('198.19.')) {
      return true;
    }

    if (hostname.startsWith('fc') || hostname.startsWith('fd') || hostname.startsWith('fe')) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
};

const createUrlSchema = z.string()
  .url('La URL debe ser válida')
  .refine((val) => !isPrivateOrLinkLocal(val), 'La URL no puede apuntar a direcciones privadas o locales');

const updateUrlSchema = z.string()
  .url('La URL debe ser válida')
  .refine((val) => !isPrivateOrLinkLocal(val), 'La URL no puede apuntar a direcciones privadas o locales')
  .optional();

export const CreateWebhookSchema = z.object({
  url: createUrlSchema,
  secret: z.string().min(8, 'El secret debe tener al menos 8 caracteres').optional(),
  events: z.array(z.string()).min(1, 'Debe seleccionar al menos un evento'),
});

export const UpdateWebhookSchema = z.object({
  url: updateUrlSchema,
  secret: z.string().min(8, 'El secret debe tener al menos 8 caracteres').optional(),
  events: z.array(z.string()).min(1, 'Debe seleccionar al menos un evento').optional(),
  active: z.boolean().optional(),
});

export const WebhookFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  active: z.boolean().optional(),
  usuarioId: z.string().optional(),
});
