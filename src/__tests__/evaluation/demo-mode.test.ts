import { describe, it, expect, beforeEach } from 'vitest';
import { StreamingService } from '@/lib/api/streaming';
import { DEMO_PRD, DEMO_LANDING_PAGE } from '@/lib/demo-data';

describe('Demo Mode', () => {
  let service: StreamingService;

  beforeEach(() => {
    service = new StreamingService('demo');
  });

  describe('PRD Generation', () => {
    it('should return pre-generated PRD in demo mode', async () => {
      const result = await service.generatePRD(
        'Test Niche',
        ['Problem 1'],
        ['Solution 1'],
        ['Requirement 1']
      );

      expect(result).toBe(DEMO_PRD);
    });

    it('should not make API calls in demo mode', async () => {
      const startTime = Date.now();
      
      await service.generatePRD(
        'Test Niche',
        ['Problem 1'],
        ['Solution 1'],
        ['Requirement 1']
      );
      
      const duration = Date.now() - startTime;
      
      // Should complete in ~500ms (simulated delay), not 5-10s (real API)
      expect(duration).toBeLessThan(1000);
      expect(duration).toBeGreaterThan(400);
    });

    it('should return consistent data across multiple calls', async () => {
      const result1 = await service.generatePRD('Niche', [], [], []);
      const result2 = await service.generatePRD('Niche', [], [], []);

      expect(result1).toBe(result2);
      expect(result1).toBe(DEMO_PRD);
    });
  });

  describe('Landing Page Generation', () => {
    it('should return pre-generated landing page in demo mode', async () => {
      const result = await service.generateLandingPage(
        'Test Niche',
        ['Problem 1'],
        ['Solution 1']
      );

      expect(result).toBe(DEMO_LANDING_PAGE);
    });

    it('should not make API calls in demo mode', async () => {
      const startTime = Date.now();
      
      await service.generateLandingPage(
        'Test Niche',
        ['Problem 1'],
        ['Solution 1']
      );
      
      const duration = Date.now() - startTime;
      
      // Should complete in ~500ms (simulated delay)
      expect(duration).toBeLessThan(1000);
      expect(duration).toBeGreaterThan(400);
    });

    it('should return valid HTML', async () => {
      const result = await service.generateLandingPage('Niche', [], []);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html');
      expect(result).toContain('</html>');
    });
  });

  describe('Demo Mode Isolation', () => {
    it('should identify demo mode correctly', () => {
      const demoService = new StreamingService('demo');
      const realService = new StreamingService('sk-or-v1-test');

      // Demo service should use demo data
      expect(demoService['apiKey']).toBe('demo');
      
      // Real service should have real key
      expect(realService['apiKey']).toBe('sk-or-v1-test');
    });

    it('should handle empty inputs gracefully', async () => {
      const prd = await service.generatePRD('', [], [], []);
      const landing = await service.generateLandingPage('', [], []);

      expect(prd).toBe(DEMO_PRD);
      expect(landing).toBe(DEMO_LANDING_PAGE);
    });

    it('should simulate realistic delay', async () => {
      const delays: number[] = [];

      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        await service.generatePRD('Niche', [], [], []);
        delays.push(Date.now() - start);
      }

      // All delays should be around 500ms
      delays.forEach(delay => {
        expect(delay).toBeGreaterThan(400);
        expect(delay).toBeLessThan(1000);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should return complete PRD with all sections', async () => {
      const prd = await service.generatePRD('Niche', [], [], []);

      expect(prd).toContain('# Product Requirements Document');
      expect(prd).toContain('## Executive Summary');
      expect(prd).toContain('FR-001');
      expect(prd).toContain('NFR-001');
    });

    it('should return self-contained HTML', async () => {
      const html = await service.generateLandingPage('Niche', [], []);

      expect(html).toContain('<style>');
      expect(html).not.toContain('<link rel="stylesheet"');
      expect(html).not.toContain('external.css');
    });
  });
});
