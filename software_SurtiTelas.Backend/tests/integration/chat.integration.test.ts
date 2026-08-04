import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '@/config/app';
import { ensureChatTestData } from './helpers/chat';

describe('Chat Integration', () => {
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

  it('should list conversations', async () => {
    const response = await request(app)
      .get('/api/v1/chat/conversations')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should list messages for conversation', async () => {
    const response = await request(app)
      .get(`/api/v1/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should send message', async () => {
    const response = await request(app)
      .post('/api/v1/chat/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId,
        content: 'Mensaje de prueba',
        messageType: 'text',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message.content).toBe('Mensaje de prueba');
  });

  it('should link order to conversation', async () => {
    const response = await request(app)
      .post(`/api/v1/chat/conversations/${conversationId}/orders`)
      .set('Authorization', `Bearer ${token}`)
      .send({ orderId: 'order-test-1' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message.messageType).toBe('order');
    expect(response.body.data.message.referenceId).toBe('order-test-1');
  });

  it('should return 401 without token', async () => {
    const response = await request(app).get('/api/v1/chat/conversations');
    expect(response.status).toBe(401);
  });
});
