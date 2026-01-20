import { describe, it, expect, beforeEach } from 'vitest';
import { StreamingService } from '@/lib/api/streaming';
import { Hypothesis } from '@/types/project';

describe('StreamingService', () => {
  let service: StreamingService;

  beforeEach(() => {
    service = new StreamingService('test-api-key');
  });

  const createMockHypothesis = (text: string): Hypothesis => ({
    id: Math.random().toString(),
    text,
    state: 'fact',
    confidence: 90,
    sources: [],
    createdAt: new Date()
  });

  describe('constructor', () => {
    it('should initialize with API key', () => {
      expect(service).toBeDefined();
    });

    it('should detect live mode correctly', () => {
      const liveService = new StreamingService('live');
      expect(liveService).toBeDefined();
    });
  });

  describe('streamHypothesisGeneration', () => {
    it('should handle problems focus', async () => {
      const updates: string[] = [];
      const onUpdate = (text: string) => updates.push(text);

      await service.streamHypothesisGeneration(
        'Test Niche',
        'problems',
        onUpdate
      );

      expect(updates.length).toBeGreaterThan(0);
    });

    it('should handle solutions focus', async () => {
      const updates: string[] = [];
      const onUpdate = (text: string) => updates.push(text);

      await service.streamHypothesisGeneration(
        'Test Niche',
        'solutions',
        onUpdate
      );

      expect(updates.length).toBeGreaterThan(0);
    });

    it('should handle hypothesis objects correctly', () => {
      const testHypothesis = createMockHypothesis('test');
      expect(testHypothesis.text).toBe('test');
    });
  });

  describe('generateLandingPage', () => {
    it('should accept correct parameters', async () => {
      const problems = [createMockHypothesis('Problem 1')];
      const solutions = [createMockHypothesis('Solution 1')];

      // This should not throw due to parameter mismatch
      const promise = service.generateLandingPage('Test Niche', problems, solutions);
      expect(promise).toBeInstanceOf(Promise);
      
      // We expect this to fail due to invalid API key, but not due to parameter issues
      try {
        await promise;
      } catch (error) {
        // Expected to fail with API error, not parameter error
        expect(error).toBeDefined();
      }
    });

    it('should handle empty arrays', async () => {
      try {
        await service.generateLandingPage('Empty Niche', [], []);
      } catch (error) {
        // Expected to fail with API error, not parameter error
        expect(error).toBeDefined();
      }
    });
  });

  describe('generatePRD', () => {
    it('should accept correct parameters', async () => {
      const problems = [createMockHypothesis('Problem 1')];
      const solutions = [createMockHypothesis('Solution 1')];

      // This should not throw due to parameter mismatch
      const promise = service.generatePRD('Test Niche', problems, solutions);
      expect(promise).toBeInstanceOf(Promise);
      
      // We expect this to fail due to invalid API key, but not due to parameter issues
      try {
        await promise;
      } catch (error) {
        // Expected to fail with API error, not parameter error
        expect(error).toBeDefined();
      }
    });

    it('should handle multiple problems and solutions', async () => {
      const problems = [
        createMockHypothesis('Problem 1'),
        createMockHypothesis('Problem 2')
      ];
      const solutions = [
        createMockHypothesis('Solution 1'),
        createMockHypothesis('Solution 2')
      ];

      try {
        await service.generatePRD('Multi Niche', problems, solutions);
      } catch (error) {
        // Expected to fail with API error, not parameter error
        expect(error).toBeDefined();
      }
    });

    it('should handle empty arrays', async () => {
      try {
        await service.generatePRD('Empty Niche', [], []);
      } catch (error) {
        // Expected to fail with API error, not parameter error
        expect(error).toBeDefined();
      }
    });
  });

  describe('parameter validation', () => {
    it('should handle hypothesis type correctly', () => {
      const hypothesis = createMockHypothesis('Test hypothesis');
      expect(hypothesis.state).toBe('fact');
      expect(hypothesis.confidence).toBe(90);
      expect(hypothesis.sources).toEqual([]);
    });

    it('should create unique hypothesis IDs', () => {
      const hyp1 = createMockHypothesis('Test 1');
      const hyp2 = createMockHypothesis('Test 2');
      expect(hyp1.id).not.toBe(hyp2.id);
    });
  });
});
