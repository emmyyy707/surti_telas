import { describe, it, expect } from 'vitest';
import { ChatbotService } from '@/modules/chat/application/services/ChatbotService';

describe('ChatbotService', () => {
  const chatbot = new ChatbotService();

  it('should respond to greeting', () => {
    const response = chatbot.getResponse('Hola, buenos días');
    expect(response).not.toBeNull();
    expect(response?.content).toContain('Hola');
  });

  it('should respond to price question', () => {
    const response = chatbot.getResponse('¿Cuál es el precio?');
    expect(response).not.toBeNull();
    expect(response?.content).toContain('precios');
  });

  it('should respond to order status question', () => {
    const response = chatbot.getResponse('¿Cuál es el estado de mi pedido?');
    expect(response).not.toBeNull();
    expect(response?.content).toContain('estado');
  });

  it('should return null for unknown message', () => {
    const response = chatbot.getResponse('mensaje aleatorio sin coincidencia');
    expect(response).toBeNull();
  });

  it('should return null for empty message', () => {
    const response = chatbot.getResponse('   ');
    expect(response).toBeNull();
  });
});
