import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StreamingService } from '@/lib/api/streaming';

describe('StreamingService', () => {
  describe('Constructor', () => {
    it('should initialize with API key', () => {
      const service = new StreamingService('test-key');
      expect(service['apiKey']).toBe('test-key');
    });

    it('should handle demo mode', () => {
      const service = new StreamingService('demo');
      expect(service['apiKey']).toBe('demo');
    });
  });

  describe('Demo Mode Detection', () => {
    it('should detect demo mode from "demo" key', () => {
      const service = new StreamingService('demo');
      expect(service['apiKey']).toBe('demo');
    });

    it('should not treat real keys as demo', () => {
      const service = new StreamingService('sk-or-v1-real-key');
      expect(service['apiKey']).not.toBe('demo');
    });
  });

  describe('PRD Generation', () => {
    it('should accept all required parameters', async () => {
      const service = new StreamingService('demo');
      
      const result = await service.generatePRD(
        'fintech',
        ['Problem 1', 'Problem 2'],
        ['Solution 1', 'Solution 2'],
        ['Requirement 1']
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty arrays', async () => {
      const service = new StreamingService('demo');
      
      const result = await service.generatePRD('niche', [], [], []);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return markdown format', async () => {
      const service = new StreamingService('demo');
      
      const result = await service.generatePRD('niche', [], [], []);

      expect(result).toContain('#');
      expect(result.length).toBeGreaterThan(100);
    });
  });

  describe('Landing Page Generation', () => {
    it('should accept required parameters', async () => {
      const service = new StreamingService('demo');
      
      const result = await service.generateLandingPage(
        'fintech',
        ['Problem 1'],
        ['Solution 1']
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return HTML format', async () => {
      const service = new StreamingService('demo');
      
      const result = await service.generateLandingPage('niche', [], []);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html');
      expect(result).toContain('</html>');
    });

    it('should handle empty problem/solution arrays', async () => {
      const service = new StreamingService('demo');
      
      const result = await service.generateLandingPage('niche', [], []);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid API key gracefully in demo mode', async () => {
      const service = new StreamingService('demo');
      
      // Demo mode should never throw
      await expect(
        service.generatePRD('niche', [], [], [])
      ).resolves.toBeDefined();
    });

    it('should handle special characters in niche', async () => {
      const service = new StreamingService('demo');
      
      const result = await service.generatePRD(
        'fintech & <payments>',
        [],
        [],
        []
      );

      expect(result).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should complete PRD generation within timeout', async () => {
      const service = new StreamingService('demo');
      
      const promise = service.generatePRD('niche', [], [], []);
      
      await expect(promise).resolves.toBeDefined();
    }, 2000); // 2 second timeout

    it('should complete landing page generation within timeout', async () => {
      const service = new StreamingService('demo');
      
      const promise = service.generateLandingPage('niche', [], []);
      
      await expect(promise).resolves.toBeDefined();
    }, 2000);

    it('should handle concurrent requests', async () => {
      const service = new StreamingService('demo');
      
      const promises = [
        service.generatePRD('niche1', [], [], []),
        service.generatePRD('niche2', [], [], []),
        service.generateLandingPage('niche3', [], []),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('Data Consistency', () => {
    it('should return same data for same inputs in demo mode', async () => {
      const service = new StreamingService('demo');
      
      const result1 = await service.generatePRD('niche', [], [], []);
      const result2 = await service.generatePRD('niche', [], [], []);

      expect(result1).toBe(result2);
    });

    it('should return different content types for different methods', async () => {
      const service = new StreamingService('demo');
      
      const prd = await service.generatePRD('niche', [], [], []);
      const landing = await service.generateLandingPage('niche', [], []);

      expect(prd).not.toBe(landing);
      expect(prd).toContain('#');
      expect(landing).toContain('<!DOCTYPE html>');
    });
  });
});
