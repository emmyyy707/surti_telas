import { describe, it, expect, vi } from 'vitest';
import { ExportConversation } from '@/modules/chat/application/use-cases/ExportConversation';

const mockConversationRepo = {
  findById: vi.fn(),
};
const mockMessageRepo = {
  findByConversationId: vi.fn(),
};

describe('ExportConversation', () => {
  it('should export conversation as json by default', async () => {
    const useCase = new ExportConversation(mockConversationRepo as any, mockMessageRepo as any);
    mockConversationRepo.findById.mockResolvedValue({ id: 'conv-1', subject: 'Test' });
    mockMessageRepo.findByConversationId.mockResolvedValue([
      { id: 'msg-1', content: 'Hola', senderId: 'user-1', senderRole: 'CLIENTE', messageType: 'text', status: 'sent', createdAt: '2024-01-01' },
    ]);

    const result = await useCase.execute('conv-1');

    expect(mockConversationRepo.findById).toHaveBeenCalledWith('conv-1');
    expect(mockMessageRepo.findByConversationId).toHaveBeenCalledWith('conv-1', undefined, 1000);
    expect(result.conversation.id).toBe('conv-1');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content).toBe('Hola');
  });

  it('should export conversation as csv', async () => {
    const useCase = new ExportConversation(mockConversationRepo as any, mockMessageRepo as any);
    mockConversationRepo.findById.mockResolvedValue({ id: 'conv-1', subject: 'Test' });
    mockMessageRepo.findByConversationId.mockResolvedValue([
      { id: 'msg-1', content: 'Hola', senderId: 'user-1', senderRole: 'CLIENTE', messageType: 'text', status: 'sent', createdAt: '2024-01-01' },
    ]);

    const result = await useCase.execute('conv-1', 'csv');

    expect(typeof result).toBe('string');
    expect(result).toContain('id,senderId,senderRole,content,messageType,status,createdAt');
    expect(result).toContain('msg-1');
  });

  it('should throw when conversation not found', async () => {
    const useCase = new ExportConversation(mockConversationRepo as any, mockMessageRepo as any);
    mockConversationRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('conv-1')).rejects.toThrow('Conversación no encontrada');
  });
});
