import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MODEL_CHAINS, callWithFallback, getModelChain, UseCase } from '../../lib/models/config';

describe('MODEL_CHAINS validation', () => {
  it('should have non-empty model arrays for all use cases', () => {
    const useCases: UseCase[] = ['ORCHESTRATOR', 'HYPOTHESIS', 'RESEARCH', 'STREAMING'];
    
    useCases.forEach(useCase => {
      expect(MODEL_CHAINS[useCase]).toBeDefined();
      expect(Array.isArray(MODEL_CHAINS[useCase])).toBe(true);
      expect(MODEL_CHAINS[useCase].length).toBeGreaterThan(0);
    });
  });

  it('should have at least one free model (:free suffix) in each chain', () => {
    Object.entries(MODEL_CHAINS).forEach(([useCase, models]) => {
      const freeModels = models.filter(model => model.includes(':free'));
      expect(freeModels.length).toBeGreaterThan(0);
    });
  });

  it('should have a paid fallback in each chain', () => {
    Object.entries(MODEL_CHAINS).forEach(([useCase, models]) => {
      const paidModels = models.filter(model => !model.includes(':free'));
      expect(paidModels.length).toBeGreaterThan(0);
    });
  });

  it('should have no duplicate models in chains', () => {
    Object.entries(MODEL_CHAINS).forEach(([useCase, models]) => {
      const uniqueModels = new Set(models);
      expect(uniqueModels.size).toBe(models.length);
    });
  });
});

describe('callWithFallback function', () => {
  let mockProvider: any;
  const testMessages = [{ role: 'user' as const, content: 'test' }];
  const testModelChain = ['model1', 'model2', 'model3'];
  const testApiKeys = ['key1', 'key2'];

  beforeEach(() => {
    mockProvider = {
      chat: vi.fn()
    };
    vi.clearAllMocks();
  });

  it('should return first successful model response', async () => {
    const expectedResponse = {
      content: 'success',
      model: 'model1',
      tokens: { prompt: 10, completion: 20, total: 30 }
    };

    mockProvider.chat.mockResolvedValueOnce(expectedResponse);

    const result = await callWithFallback(mockProvider, testMessages, testModelChain, testApiKeys);

    expect(result.response).toEqual(expectedResponse);
    expect(result.modelUsed).toBe('model1');
    expect(result.apiKeyUsed).toBe('key1');
    expect(mockProvider.chat).toHaveBeenCalledTimes(1);
    expect(mockProvider.chat).toHaveBeenCalledWith(testMessages, 'model1');
  });

  it('should try next model on rate limit (429) error', async () => {
    const rateLimitError = new Error('Rate limit exceeded');
    (rateLimitError as any).status = 429;
    
    const successResponse = {
      content: 'success',
      model: 'model2',
      tokens: { prompt: 10, completion: 20, total: 30 }
    };

    mockProvider.chat
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(successResponse);

    const result = await callWithFallback(mockProvider, testMessages, testModelChain, testApiKeys);

    expect(result.response).toEqual(successResponse);
    expect(result.modelUsed).toBe('model2');
    expect(result.apiKeyUsed).toBe('key1');
    expect(mockProvider.chat).toHaveBeenCalledTimes(2);
  });

  it('should try next model on generic errors', async () => {
    const genericError = new Error('Generic error');
    
    const successResponse = {
      content: 'success',
      model: 'model2',
      tokens: { prompt: 10, completion: 20, total: 30 }
    };

    mockProvider.chat
      .mockRejectedValueOnce(genericError)
      .mockResolvedValueOnce(successResponse);

    const result = await callWithFallback(mockProvider, testMessages, testModelChain, testApiKeys);

    expect(result.response).toEqual(successResponse);
    expect(result.modelUsed).toBe('model2');
    expect(result.apiKeyUsed).toBe('key1');
    expect(mockProvider.chat).toHaveBeenCalledTimes(2);
  });

  it('should rotate to next API key after all models fail', async () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');
    const error3 = new Error('Error 3');
    
    const successResponse = {
      content: 'success',
      model: 'model1',
      tokens: { prompt: 10, completion: 20, total: 30 }
    };

    mockProvider.chat
      .mockRejectedValueOnce(error1)  // key1, model1
      .mockRejectedValueOnce(error2)  // key1, model2
      .mockRejectedValueOnce(error3)  // key1, model3
      .mockResolvedValueOnce(successResponse); // key2, model1

    const result = await callWithFallback(mockProvider, testMessages, testModelChain, testApiKeys);

    expect(result.response).toEqual(successResponse);
    expect(result.modelUsed).toBe('model1');
    expect(result.apiKeyUsed).toBe('key2');
    expect(mockProvider.chat).toHaveBeenCalledTimes(4);
  });

  it('should throw error when all models AND all API keys exhausted', async () => {
    const error = new Error('All failed');
    mockProvider.chat.mockRejectedValue(error);

    await expect(
      callWithFallback(mockProvider, testMessages, testModelChain, testApiKeys)
    ).rejects.toThrow('All models failed');

    // Should try all models with all API keys
    expect(mockProvider.chat).toHaveBeenCalledTimes(6); // 3 models × 2 keys
  });

  it('should handle rate limit error messages correctly', async () => {
    const rateLimitError = new Error('quota exceeded');
    
    const successResponse = {
      content: 'success',
      model: 'model2',
      tokens: { prompt: 10, completion: 20, total: 30 }
    };

    mockProvider.chat
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(successResponse);

    const result = await callWithFallback(mockProvider, testMessages, testModelChain, testApiKeys);

    expect(result.modelUsed).toBe('model2');
    expect(mockProvider.chat).toHaveBeenCalledTimes(2);
  });

  it('should handle empty API keys array', async () => {
    await expect(
      callWithFallback(mockProvider, testMessages, testModelChain, [])
    ).rejects.toThrow('All models failed');
  });

  it('should return correct modelUsed and apiKeyUsed for different scenarios', async () => {
    const successResponse = {
      content: 'success',
      model: 'model3',
      tokens: { prompt: 10, completion: 20, total: 30 }
    };

    mockProvider.chat
      .mockRejectedValueOnce(new Error('fail1'))  // key1, model1
      .mockRejectedValueOnce(new Error('fail2'))  // key1, model2
      .mockResolvedValueOnce(successResponse);     // key1, model3

    const result = await callWithFallback(mockProvider, testMessages, testModelChain, testApiKeys);

    expect(result.modelUsed).toBe('model3');
    expect(result.apiKeyUsed).toBe('key1');
  });
});

describe('getModelChain function', () => {
  it('should return correct chain for each UseCase', () => {
    expect(getModelChain('ORCHESTRATOR')).toEqual(MODEL_CHAINS.ORCHESTRATOR);
    expect(getModelChain('HYPOTHESIS')).toEqual(MODEL_CHAINS.HYPOTHESIS);
    expect(getModelChain('RESEARCH')).toEqual(MODEL_CHAINS.RESEARCH);
    expect(getModelChain('STREAMING')).toEqual(MODEL_CHAINS.STREAMING);
  });

  it('should fall back to ORCHESTRATOR for unknown use cases', () => {
    const unknownUseCase = 'UNKNOWN' as UseCase;
    expect(getModelChain(unknownUseCase)).toEqual(MODEL_CHAINS.ORCHESTRATOR);
  });

  it('should return arrays with proper structure', () => {
    const useCases: UseCase[] = ['ORCHESTRATOR', 'HYPOTHESIS', 'RESEARCH', 'STREAMING'];
    
    useCases.forEach(useCase => {
      const chain = getModelChain(useCase);
      expect(Array.isArray(chain)).toBe(true);
      expect(chain.length).toBeGreaterThan(0);
      chain.forEach(model => {
        expect(typeof model).toBe('string');
        expect(model.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Integration tests', () => {
  it('should have consistent model chains across use cases', () => {
    // Ensure all chains have deepseek/deepseek-chat as final fallback
    Object.values(MODEL_CHAINS).forEach(chain => {
      expect(chain[chain.length - 1]).toBe('deepseek/deepseek-chat');
    });
  });

  it('should have proper model format in all chains', () => {
    Object.values(MODEL_CHAINS).forEach(chain => {
      chain.forEach(model => {
        // Should be in format: provider/model-name or provider/model-name:free
        expect(model).toMatch(/^[a-z-]+\/[a-z0-9.-]+(:free)?$/);
      });
    });
  });

  it('should have reasonable chain lengths', () => {
    Object.values(MODEL_CHAINS).forEach(chain => {
      expect(chain.length).toBeGreaterThanOrEqual(3);
      expect(chain.length).toBeLessThanOrEqual(6);
    });
  });
});
