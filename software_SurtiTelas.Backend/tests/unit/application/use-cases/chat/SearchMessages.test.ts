import { describe, it, expect, vi } from 'vitest';
import { SearchMessages } from '@/modules/chat/application/use-cases/SearchMessages';

const createMockRepo = () => ({
  search: vi.fn(),
});

describe('SearchMessages', () => {
  it('should call repo with query and filters', async () => {
    const mockRepo = createMockRepo();
    const useCase = new SearchMessages(mockRepo as any);
    mockRepo.search.mockResolvedValue([]);

    const result = await useCase.execute('conv-1', 'hola', 10, '2024-01-01', '2024-12-31', 'user-1', 'text', 'sent');

    expect(mockRepo.search).toHaveBeenCalledWith('conv-1', 'hola', 10, '2024-01-01', '2024-12-31', 'user-1', 'text', 'sent');
    expect(result).toEqual([]);
  });

  it('should return empty array when query is empty', async () => {
    const mockRepo = createMockRepo();
    const useCase = new SearchMessages(mockRepo as any);
    const result = await useCase.execute('conv-1', '   ', 10);
    expect(result).toEqual([]);
    expect(mockRepo.search).not.toHaveBeenCalled();
  });
});
