import { describe, it, expect } from 'vitest';
import { FALLBACK_CHAIN, AUTOCODER_FALLBACK_CHAIN, PRIMARY_MODEL, DEFAULT_MODEL } from '../../lib/config/models';

describe('Model Configuration', () => {
  it('should have valid FALLBACK_CHAIN', () => {
    expect(Array.isArray(FALLBACK_CHAIN)).toBe(true);
    expect(FALLBACK_CHAIN.length).toBe(3);
    expect(FALLBACK_CHAIN[0]).toBe('google/gemini-2.5-flash-lite');
    expect(FALLBACK_CHAIN[1]).toBe('z-ai/glm-4.7-flash');
    expect(FALLBACK_CHAIN[2]).toBe('deepseek/deepseek-v3.2-speciale');
  });

  it('should have valid AUTOCODER_FALLBACK_CHAIN', () => {
    expect(Array.isArray(AUTOCODER_FALLBACK_CHAIN)).toBe(true);
    expect(AUTOCODER_FALLBACK_CHAIN.length).toBeGreaterThanOrEqual(3);
    // Models may be reordered — just check they exist
    const models = [...AUTOCODER_FALLBACK_CHAIN];
    expect(models.every(m => typeof m === 'string' && m.includes('/'))).toBe(true);
  });

  it('should have no duplicate models in FALLBACK_CHAIN', () => {
    const uniqueModels = new Set(FALLBACK_CHAIN);
    expect(uniqueModels.size).toBe(FALLBACK_CHAIN.length);
  });

  it('should have no duplicate models in AUTOCODER_FALLBACK_CHAIN', () => {
    const uniqueModels = new Set(AUTOCODER_FALLBACK_CHAIN);
    expect(uniqueModels.size).toBe(AUTOCODER_FALLBACK_CHAIN.length);
  });

  it('should have PRIMARY_MODEL as first in FALLBACK_CHAIN', () => {
    expect(PRIMARY_MODEL).toBe(FALLBACK_CHAIN[0]);
  });

  it('should have DEFAULT_MODEL equal to PRIMARY_MODEL', () => {
    expect(DEFAULT_MODEL).toBe(PRIMARY_MODEL);
  });
});
