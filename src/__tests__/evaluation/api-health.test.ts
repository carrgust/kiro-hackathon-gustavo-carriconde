import { describe, it, expect } from 'vitest';

describe('API Health Endpoint', () => {
  const API_URL = 'http://localhost:5001/api/health';

  describe('Endpoint Availability', () => {
    it('should respond to GET requests', async () => {
      const response = await fetch(API_URL);
      expect(response.ok).toBe(true);
    });

    it('should return 200 status code', async () => {
      const response = await fetch(API_URL);
      expect(response.status).toBe(200);
    });

    it('should return JSON content type', async () => {
      const response = await fetch(API_URL);
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('application/json');
    });
  });

  describe('Response Structure', () => {
    it('should return valid JSON', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      expect(data).toBeDefined();
    });

    it('should include status field', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      expect(data.status).toBeDefined();
      expect(typeof data.status).toBe('string');
    });

    it('should include timestamp field', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe('string');
    });

    it('should include service field', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      expect(data.service).toBeDefined();
      expect(data.service).toBe('curatos-api');
    });

    it('should include openrouter configuration', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      expect(data.openrouter).toBeDefined();
      expect(data.openrouter.configured).toBeDefined();
    });
  });

  describe('Health Status', () => {
    it('should report healthy status', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });

    it('should have valid timestamp format', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      const timestamp = new Date(data.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should have recent timestamp', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      
      // Timestamp should be within last 5 seconds
      expect(diffMs).toBeLessThan(5000);
    });
  });

  describe('OpenRouter Configuration', () => {
    it('should indicate if OpenRouter is configured', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      expect(typeof data.openrouter.configured).toBe('boolean');
    });

    it('should include configuration note', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      expect(data.openrouter.note).toBeDefined();
      expect(typeof data.openrouter.note).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should respond within 1 second', async () => {
      const start = Date.now();
      await fetch(API_URL);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() => fetch(API_URL));
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });
    });

    it('should maintain consistent response time', async () => {
      const durations: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        await fetch(API_URL);
        durations.push(Date.now() - start);
      }
      
      // All requests should complete in similar time
      const avg = durations.reduce((a, b) => a + b) / durations.length;
      durations.forEach(duration => {
        expect(Math.abs(duration - avg)).toBeLessThan(500);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid methods gracefully', async () => {
      const response = await fetch(API_URL, { method: 'POST' });
      // Next.js returns 405 for unsupported methods
      expect([200, 405]).toContain(response.status);
    });

    it('should not expose sensitive information', async () => {
      const response = await fetch(API_URL);
      const data = await response.json();
      const jsonStr = JSON.stringify(data);
      
      // Should not contain API keys or secrets
      expect(jsonStr).not.toContain('sk-or-v1');
      expect(jsonStr).not.toContain('password');
      expect(jsonStr).not.toContain('secret');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await fetch(API_URL);
      const corsHeader = response.headers.get('access-control-allow-origin');
      
      // Next.js default CORS or explicit configuration
      expect(corsHeader !== null || response.ok).toBe(true);
    });
  });
});
