import { PrismaClient } from '@prisma/client';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelay: 100,
  maxDelay: 5000,
};

class DatabaseClient {
  private prisma: PrismaClient | null = null;
  private retryConfig: RetryConfig;

  constructor(config: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = config;
    
    if (process.env.DATABASE_URL) {
      try {
        this.prisma = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
      } catch (error) {
        console.error('[DB] Failed to initialize Prisma:', error);
      }
    }
  }

  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryableError(error) || attempt === this.retryConfig.maxRetries - 1) {
          throw error;
        }

        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );

        console.warn(`[DB] Retry attempt ${attempt + 1}/${this.retryConfig.maxRetries} after ${delay}ms`);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = ['P1001', 'P1002', 'P1008', 'P1017'];
    return retryableCodes.includes(error?.code);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database client not initialized. DATABASE_URL may be missing.');
    }
    return this.prisma;
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}

let dbClient: DatabaseClient | null = null;

export function getDbClient(): DatabaseClient {
  if (!dbClient) {
    dbClient = new DatabaseClient();
  }
  return dbClient;
}

export function getPrisma(): PrismaClient {
  return getDbClient().getClient();
}
