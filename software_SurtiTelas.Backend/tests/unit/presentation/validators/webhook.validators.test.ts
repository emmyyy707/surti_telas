import { describe, it, expect } from 'vitest';
import { CreateWebhookSchema, UpdateWebhookSchema, WebhookFiltersSchema } from '@/modules/webhooks/presentation/validators/webhook.validators';

describe('webhook.validators', () => {
  describe('CreateWebhookSchema', () => {
    it('should accept valid webhook', () => {
      const result = CreateWebhookSchema.parse({
        url: 'https://example.com/webhook',
        secret: 'my-secret-key',
        events: ['order.created'],
      });
      expect(result.url).toBe('https://example.com/webhook');
      expect(result.secret).toBe('my-secret-key');
    });

    it('should reject private/local URLs', () => {
      expect(() => CreateWebhookSchema.parse({
        url: 'http://localhost:3000/webhook',
        secret: 'my-secret-key',
        events: ['order.created'],
      })).toThrow('La URL no puede apuntar a direcciones privadas o locales');
    });

    it('should reject 127.0.0.1', () => {
      expect(() => CreateWebhookSchema.parse({
        url: 'http://127.0.0.1/webhook',
        secret: 'my-secret-key',
        events: ['order.created'],
      })).toThrow('La URL no puede apuntar a direcciones privadas o locales');
    });

    it('should reject 10.x.x.x', () => {
      expect(() => CreateWebhookSchema.parse({
        url: 'http://10.0.0.1/webhook',
        secret: 'my-secret-key',
        events: ['order.created'],
      })).toThrow('La URL no puede apuntar a direcciones privadas o locales');
    });

    it('should reject 192.168.x.x', () => {
      expect(() => CreateWebhookSchema.parse({
        url: 'http://192.168.1.1/webhook',
        secret: 'my-secret-key',
        events: ['order.created'],
      })).toThrow('La URL no puede apuntar a direcciones privadas o locales');
    });

    it('should reject short secrets', () => {
      expect(() => CreateWebhookSchema.parse({
        url: 'https://example.com/webhook',
        secret: 'short',
        events: ['order.created'],
      })).toThrow('El secret debe tener al menos 8 caracteres');
    });

    it('should require at least one event', () => {
      expect(() => CreateWebhookSchema.parse({
        url: 'https://example.com/webhook',
        secret: 'my-secret-key',
        events: [],
      })).toThrow('Debe seleccionar al menos un evento');
    });
  });

  describe('UpdateWebhookSchema', () => {
    it('should accept partial update', () => {
      const result = UpdateWebhookSchema.parse({
        active: false,
      });
      expect(result.active).toBe(false);
    });

    it('should reject private URLs on update', () => {
      expect(() => UpdateWebhookSchema.parse({
        url: 'http://localhost:3000/webhook',
      })).toThrow('La URL no puede apuntar a direcciones privadas o locales');
    });
  });

  describe('WebhookFiltersSchema', () => {
    it('should accept empty filters', () => {
      const result = WebhookFiltersSchema.parse({});
      expect(result).toEqual({});
    });

    it('should accept pagination params', () => {
      const result = WebhookFiltersSchema.parse({ page: 2, limit: 10, cursor: 'abc123' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.cursor).toBe('abc123');
    });

    it('should coerce page and limit to numbers', () => {
      const result = WebhookFiltersSchema.parse({ page: '2', limit: '10' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('should reject limit > 100', () => {
      expect(() => WebhookFiltersSchema.parse({ limit: 101 })).toThrow();
    });

    it('should accept active filter', () => {
      const result = WebhookFiltersSchema.parse({ active: true });
      expect(result.active).toBe(true);
    });
  });
});
