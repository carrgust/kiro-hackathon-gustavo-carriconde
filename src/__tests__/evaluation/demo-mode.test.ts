import { describe, it, expect, beforeEach } from 'vitest';
import { StreamingService } from '@/lib/api/streaming';
import { DEMO_PRD, DEMO_LANDING_PAGE } from '@/lib/demo-data';
import { Hypothesis } from '@/types/project';

describe('Demo Mode', () => {
  let service: StreamingService;

  beforeEach(() => {
    service = new StreamingService('demo');
  });

  const createMockHypothesis = (text: string): Hypothesis => ({
    id: Math.random().toString(),
    text,
    state: 'fact',
    confidence: 90,
    sources: [],
    createdAt: new Date()
  });

  describe('generatePRD', () => {
    it('should return demo PRD when in demo mode', async () => {
      const result = await service.generatePRD(
        'Test Niche',
        [createMockHypothesis('Problem 1')],
        [createMockHypothesis('Solution 1')]
      );

      expect(result).toBe(DEMO_PRD);
    });

    it('should handle empty arrays', async () => {
      const result = await service.generatePRD(
        'Empty Niche',
        [],
        []
      );

      expect(result).toBe(DEMO_PRD);
    });

    it('should work with multiple problems and solutions', async () => {
      const result1 = await service.generatePRD(
        'Multi Niche',
        [createMockHypothesis('Problem 1'), createMockHypothesis('Problem 2')],
        [createMockHypothesis('Solution 1'), createMockHypothesis('Solution 2')]
      );
      const result2 = await service.generatePRD(
        'Multi Niche',
        [createMockHypothesis('Problem 1'), createMockHypothesis('Problem 2')],
        [createMockHypothesis('Solution 1'), createMockHypothesis('Solution 2')]
      );

      expect(result1).toBe(DEMO_PRD);
      expect(result2).toBe(DEMO_PRD);
    });

    it('should handle hypothesis objects correctly', () => {
      const testHypothesis = createMockHypothesis('test');
      expect(testHypothesis.text).toBe('test');
    });
  });

  describe('generateLandingPage', () => {
    it('should return demo landing page when in demo mode', async () => {
      const result = await service.generateLandingPage(
        'Test Niche',
        [createMockHypothesis('Problem 1')],
        [createMockHypothesis('Solution 1')]
      );

      expect(result).toBe(DEMO_LANDING_PAGE);
    });

    it('should handle hypothesis objects correctly', () => {
      const testHypothesis = createMockHypothesis('test');
      expect(testHypothesis.text).toBe('test');
    });
  });

  describe('streamHypothesisGeneration', () => {
    it('should handle streaming in demo mode', async () => {
      const updates: string[] = [];
      const onUpdate = (text: string) => updates.push(text);

      await service.streamHypothesisGeneration(
        'Test Niche',
        'problems',
        onUpdate
      );

      expect(updates.length).toBeGreaterThan(0);
      expect(updates.some(update => update.includes('Test Niche'))).toBe(true);
    });

    it('should handle solutions focus', async () => {
      const updates: string[] = [];
      const onUpdate = (text: string) => updates.push(text);

      await service.streamHypothesisGeneration(
        'Solution Niche',
        'solutions',
        onUpdate
      );

      expect(updates.length).toBeGreaterThan(0);
    });

    it('should provide meaningful updates', async () => {
      const updates: string[] = [];
      const onUpdate = (text: string) => updates.push(text);

      await service.streamHypothesisGeneration(
        'Meaningful Niche',
        'problems',
        onUpdate
      );

      expect(updates.length).toBeGreaterThan(0);
      const hasNicheReference = updates.some(update => 
        update.toLowerCase().includes('meaningful niche') || 
        update.toLowerCase().includes('meaningful')
      );
      expect(hasNicheReference).toBe(true);
    });

    it('should handle multiple concurrent streams', async () => {
      const updates1: string[] = [];
      const updates2: string[] = [];
      
      const stream1 = service.streamHypothesisGeneration(
        'Niche 1',
        'problems',
        (text) => updates1.push(text)
      );
      
      const stream2 = service.streamHypothesisGeneration(
        'Niche 2',
        'solutions',
        (text) => updates2.push(text)
      );

      await Promise.all([stream1, stream2]);

      expect(updates1.length).toBeGreaterThan(0);
      expect(updates2.length).toBeGreaterThan(0);
    });
  });
});
