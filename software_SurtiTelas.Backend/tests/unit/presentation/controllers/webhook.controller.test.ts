import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { listWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook } from '@/modules/webhooks/presentation/controllers/webhook.controller';

vi.mock('@/modules/webhooks/infrastructure/container/webhookContainer', () => ({
  webhookUseCases: {
    listWebhooks: { execute: vi.fn() },
    getWebhookById: { execute: vi.fn() },
    createWebhook: { execute: vi.fn() },
    updateWebhook: { execute: vi.fn() },
    deleteWebhook: { execute: vi.fn() },
  },
}));

const mockReq = (overrides = {}) => ({ user: { id: 'user-1' }, params: {}, query: {}, body: {}, ...overrides }) as unknown as Request;
const mockRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('webhook.controller', () => {
  it('listWebhooks should return paginated webhooks', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { webhookUseCases } = await import('@/modules/webhooks/infrastructure/container/webhookContainer');
    (webhookUseCases.listWebhooks.execute as any).mockResolvedValue({
      data: [{ id: '1', url: 'https://example.com', events: [], active: true }],
      meta: { total: 1, page: 1, limit: 10 },
    });

    await listWebhooks(req, res);

    expect(webhookUseCases.listWebhooks.execute).toHaveBeenCalledWith({ usuarioId: 'user-1', page: 1, limit: 10 });
    expect(res.json).toHaveBeenCalled();
  });

  it('getWebhook should return webhook with HATEOAS links', async () => {
    const req = mockReq({ params: { id: '1' } });
    const res = mockRes();
    const { webhookUseCases } = await import('@/modules/webhooks/infrastructure/container/webhookContainer');
    (webhookUseCases.getWebhookById.execute as any).mockResolvedValue({ id: '1', url: 'https://example.com', secret: 'secret', events: [] });

    await getWebhook(req, res);

    expect(webhookUseCases.getWebhookById.execute).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalled();
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.data).toHaveProperty('_links');
    expect(jsonCall.data._links.self).toBe('/api/v1/webhooks/1');
  });

  it('createWebhook should create webhook and sanitize secret', async () => {
    const req = mockReq({ body: { url: 'https://example.com', secret: 'my-secret', events: ['order.created'] } });
    const res = mockRes();
    const { webhookUseCases } = await import('@/modules/webhooks/infrastructure/container/webhookContainer');
    (webhookUseCases.createWebhook.execute as any).mockResolvedValue({ id: '1', url: 'https://example.com', secret: 'my-secret', events: ['order.created'] });

    await createWebhook(req, res);

    expect(webhookUseCases.createWebhook.execute).toHaveBeenCalledWith({ url: 'https://example.com', secret: 'my-secret', events: ['order.created'], usuarioId: 'user-1' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updateWebhook should update webhook', async () => {
    const req = mockReq({ params: { id: '1' }, body: { active: false } });
    const res = mockRes();
    const { webhookUseCases } = await import('@/modules/webhooks/infrastructure/container/webhookContainer');
    (webhookUseCases.updateWebhook.execute as any).mockResolvedValue({ id: '1', active: false });

    await updateWebhook(req, res);

    expect(webhookUseCases.updateWebhook.execute).toHaveBeenCalledWith('1', { active: false });
    expect(res.json).toHaveBeenCalled();
  });

  it('deleteWebhook should delete webhook', async () => {
    const req = mockReq({ params: { id: '1' } });
    const res = mockRes();
    const { webhookUseCases } = await import('@/modules/webhooks/infrastructure/container/webhookContainer');
    (webhookUseCases.deleteWebhook.execute as any).mockResolvedValue(undefined);

    await deleteWebhook(req, res);

    expect(webhookUseCases.deleteWebhook.execute).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
