import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { ensureChatTestData } from './helpers/chat';

describe('Chat Metrics and Surveys Integration', () => {
  let app: Express;
  let token: string;
  let conversationId: string;

  beforeAll(async () => {
    app = createApp();
    const data = await ensureChatTestData();
    conversationId = data.conversation.id;
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'chat-advisor@surtitelas.com', password: 'asesor123' });
    token = response.body.data.accessToken;
  });

  it('should return chat metrics', async () => {
    const response = await request(app)
      .get(`/api/v1/chat/conversations/${conversationId}/metrics`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalMessages).toBeGreaterThanOrEqual(0);
    expect(response.body.data).toHaveProperty('unreadMessages');
    expect(response.body.data).toHaveProperty('clientMessages');
    expect(response.body.data).toHaveProperty('advisorMessages');
    expect(response.body.data).toHaveProperty('botMessages');
    expect(response.body.data).toHaveProperty('totalReactions');
    expect(response.body.data).toHaveProperty('responseTimeSeconds');
  });

  it('should return 401 without token for metrics', async () => {
    const response = await request(app)
      .get(`/api/v1/chat/conversations/${conversationId}/metrics`);
    expect(response.status).toBe(401);
  });
});
