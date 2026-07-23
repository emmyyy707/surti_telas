import { describe, it, expect, vi } from 'vitest';
import { CreateWebhook } from '@/modules/webhooks/application/use-cases/WebhookUseCases';

const mockRepo = {
  create: vi.fn(),
};

describe('CreateWebhook', () => {
  it('should use provided secret', async () => {
    const useCase = new CreateWebhook(mockRepo as any);
    mockRepo.create.mockResolvedValue({ id: '1', url: 'https://example.com', secret: 'provided-secret', events: [] });

    const result = await useCase.execute({
      url: 'https://example.com/webhook',
      secret: 'provided-secret',
      events: ['order.created'],
    });

    expect(mockRepo.create).toHaveBeenCalledWith({
      url: 'https://example.com/webhook',
      secret: 'provided-secret',
      events: ['order.created'],
      usuarioId: undefined,
    });
    expect(result.secret).toBe('provided-secret');
  });

  it('should generate a secret when not provided', async () => {
    const useCase = new CreateWebhook(mockRepo as any);
    mockRepo.create.mockResolvedValue({ id: '1', url: 'https://example.com', secret: 'generated-secret', events: [] });

    const result = await useCase.execute({
      url: 'https://example.com/webhook',
      events: ['order.created'],
    });

    expect(mockRepo.create).toHaveBeenCalledWith({
      url: 'https://example.com/webhook',
      secret: expect.any(String),
      events: ['order.created'],
      usuarioId: undefined,
    });
    expect(result.secret).toBe('generated-secret');
  });
});
