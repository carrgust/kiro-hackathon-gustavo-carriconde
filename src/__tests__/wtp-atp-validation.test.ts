import { describe, it, expect } from 'vitest';
import { calculateCombinedScore, getHypothesisState, processValidationResult } from '@/lib/wtp-atp-utils';
import { HypothesisCheck } from '@/types/project';

describe('WTP/ATP Validation System', () => {
  describe('calculateCombinedScore', () => {
    it('should calculate combined score with correct weights', () => {
      expect(calculateCombinedScore(100, 100)).toBe(100);
      expect(calculateCombinedScore(80, 60)).toBe(72); // (80 * 0.6) + (60 * 0.4) = 48 + 24 = 72
      expect(calculateCombinedScore(60, 80)).toBe(68); // (60 * 0.6) + (80 * 0.4) = 36 + 32 = 68
      expect(calculateCombinedScore(0, 0)).toBe(0);
    });
  });

  describe('getHypothesisState', () => {
    it('should return correct states based on thresholds', () => {
      expect(getHypothesisState(90)).toBe('fact');
      expect(getHypothesisState(85)).toBe('fact');
      expect(getHypothesisState(84)).toBe('validated');
      expect(getHypothesisState(60)).toBe('validated');
      expect(getHypothesisState(59)).toBe('hypothesis');
      expect(getHypothesisState(40)).toBe('hypothesis');
      expect(getHypothesisState(39)).toBe('rejected');
      expect(getHypothesisState(0)).toBe('rejected');
    });
  });

  describe('processValidationResult', () => {
    it('should process WTP/ATP results correctly', () => {
      const check: HypothesisCheck = {
        wtp: 90,
        atp: 80,
        reasoning: 'Strong evidence for both dimensions'
      };

      const result = processValidationResult(check);
      expect(result.confidence).toBe(86); // (90 * 0.6) + (80 * 0.4) = 86
      expect(result.state).toBe('fact');
    });

    it('should handle edge cases', () => {
      const lowCheck: HypothesisCheck = {
        wtp: 30,
        atp: 20,
        reasoning: 'Weak evidence'
      };

      const result = processValidationResult(lowCheck);
      expect(result.confidence).toBe(26); // (30 * 0.6) + (20 * 0.4) = 26
      expect(result.state).toBe('rejected');
    });
  });
});
