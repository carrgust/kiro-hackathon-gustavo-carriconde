export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
};

export function isRetryableError(error: any): boolean {
  // DON'T retry 429 - rate limit should fail fast
  if (error?.message?.includes('429')) return false;
  if (error?.status === 429) return false;
  
  // Only retry network errors and 5xx
  if (error?.message?.includes('fetch failed')) return true;
  if (error?.message?.match(/5\d{2}/)) return true;
  if (error?.status >= 500) return true;
  return false;
}

export function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(exponentialDelay, config.maxDelay);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (!isRetryableError(error) || attempt === config.maxRetries - 1) {
        throw error;
      }

      const delay = calculateDelay(attempt, config);
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
