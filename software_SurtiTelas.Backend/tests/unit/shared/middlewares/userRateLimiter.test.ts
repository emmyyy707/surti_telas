import { describe, it, expect, vi } from 'vitest';
import { userRateLimiter } from '@/modules/shared/presentation/middlewares/userRateLimiter';

const next = vi.fn();
const makeReq = (overrides = {}) => ({ user: undefined, ip: '1.2.3.4', ...overrides }) as any;

describe('userRateLimiter', () => {
  beforeEach(() => {
    next.mockClear();
  });

  it('allows the first request and calls next', () => {
    const req = makeReq({ user: { id: 'u-1' } });
    userRateLimiter(req, {} as any, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('uses the ip when there is no user', () => {
    const req = makeReq();
    userRateLimiter(req, {} as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 429 when the limit is exceeded', () => {
    const req = makeReq({ user: { id: 'u-exceed' } });
    for (let i = 0; i < 100; i++) {
      userRateLimiter(req, { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as any, vi.fn());
    }
    next.mockClear();
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as any;
    userRateLimiter(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json.mock.calls[0][0].error).toBe('too_many_requests');
    expect(next).not.toHaveBeenCalled();
  });

  it('allows requests after the window resets', () => {
    vi.useFakeTimers();
    try {
      const req = makeReq({ user: { id: 'u-reset' } });
      userRateLimiter(req, { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as any, next);
      vi.advanceTimersByTime(15 * 60 * 1000 + 1);
      userRateLimiter(req, { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as any, next);
      expect(next).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
