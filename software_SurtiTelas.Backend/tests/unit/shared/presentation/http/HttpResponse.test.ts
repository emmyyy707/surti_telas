import { describe, it, expect, vi } from 'vitest';
import { ok, created, noContent } from '@/shared/presentation/http/HttpResponse';

const mockRes = () => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res as any;
};

describe('HttpResponse', () => {
  it('ok returns 200 with success envelope', () => {
    const res = mockRes();
    ok(res, { a: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { a: 1 }, message: undefined });
  });

  it('ok includes an optional message', () => {
    const res = mockRes();
    ok(res, { a: 1 }, 'listo');
    expect(res.json.mock.calls[0][0].message).toBe('listo');
  });

  it('created returns 201', () => {
    const res = mockRes();
    created(res, { id: '1' }, 'creado');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0]).toMatchObject({ success: true, data: { id: '1' }, message: 'creado' });
  });

  it('noContent returns 204', () => {
    const res = mockRes();
    noContent(res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
