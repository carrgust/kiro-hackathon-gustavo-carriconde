# STORY: Database Setup with Prisma & Neon

**Priority:** P0 (Critical)  
**Status:** Not Started  
**Estimated Effort:** 6-8 hours  
**Owner:** TBD

---

## Goal

Set up production-ready database infrastructure with Prisma ORM, local PostgreSQL for development, and Neon serverless PostgreSQL for production.

---

## Context

Curatos requires persistent storage for:
- User accounts and authentication
- Wallet/credit system (3 free credits, purchase tracking)
- Research sessions (hypothesis validation state)
- Transaction history (credits, Stripe payments)

**Requirements:**
- Local development with Docker PostgreSQL
- Production deployment on Neon (serverless, auto-scaling)
- Connection pooling for serverless cold starts
- Type-safe database access with Prisma

---

## Acceptance Criteria

### 1. Prisma Schema Definition
- [ ] User model with relations
- [ ] Wallet model with credit tracking
- [ ] Research model with JSON results field
- [ ] Transaction model with Stripe integration
- [ ] Proper indexes for performance
- [ ] Timestamps on all models

### 2. Local Development Setup
- [ ] Docker Compose with PostgreSQL 15+
- [ ] Persistent volume for data
- [ ] pgAdmin for database management (optional)
- [ ] One-command startup (`docker-compose up`)

### 3. Neon Production Setup
- [ ] Neon project created
- [ ] Connection pooler configured
- [ ] Environment variables documented
- [ ] Connection string format validated

### 4. Database Retry Wrapper
- [ ] Retry logic for connection failures
- [ ] Exponential backoff for cold starts
- [ ] Max retry attempts (3-5)
- [ ] Logging for debugging

### 5. Seed Script
- [ ] 3 test users with different scenarios
- [ ] Wallet balances (0, 3, 10 credits)
- [ ] Sample research sessions
- [ ] Sample transactions

### 6. Migration Workflow
- [ ] Initial migration created
- [ ] Migration commands documented
- [ ] Rollback strategy defined
- [ ] Production migration checklist

---

## Technical Design

### 1. Prisma Schema

**File:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String      @id @default(cuid())
  email      String      @unique
  name       String?
  image      String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  
  wallet     Wallet?
  researches Research[]
  transactions Transaction[]
  
  @@index([email])
}

model Wallet {
  id             String   @id @default(cuid())
  userId         String   @unique
  balance        Int      @default(3)
  totalPurchased Int      @default(0)
  totalUsed      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model Research {
  id              String   @id @default(cuid())
  userId          String
  title           String
  inputIdea       String   @db.Text
  status          String   @default("pending") // pending, running, completed, failed
  currentEngine   Int      @default(0)
  confidenceScore Float?
  results         Json?    // Store engine results as JSON
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  completedAt     DateTime?
  
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model Transaction {
  id               String   @id @default(cuid())
  userId           String
  type             String   // purchase, usage, refund
  credits          Int
  researchId       String?
  stripePaymentId  String?  @unique
  createdAt        DateTime @default(now())
  
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  research Research? @relation(fields: [researchId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([type])
  @@index([createdAt])
}
```

### 2. Docker Compose Setup

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: curatos-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: curatos
      POSTGRES_PASSWORD: curatos_dev_password
      POSTGRES_DB: curatos_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U curatos"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: curatos-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@curatos.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 3. Database Retry Wrapper

**File:** `src/lib/db/client.ts`

```typescript
import { PrismaClient } from '@prisma/client';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 5,
  baseDelay: 100,
  maxDelay: 5000,
};

class DatabaseClient {
  private prisma: PrismaClient;
  private retryConfig: RetryConfig;

  constructor(config: RetryConfig = defaultRetryConfig) {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    this.retryConfig = config;
  }

  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on non-connection errors
        if (!this.isRetryableError(error)) {
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Singleton instance
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
```

### 4. Seed Script

**File:** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // User 1: New user with free credits
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      wallet: {
        create: {
          balance: 3,
          totalPurchased: 0,
          totalUsed: 0,
        },
      },
    },
  });

  // User 2: User who used all free credits
  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      wallet: {
        create: {
          balance: 0,
          totalPurchased: 0,
          totalUsed: 3,
        },
      },
    },
  });

  // User 3: Power user with purchased credits
  const user3 = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: {
      email: 'carol@example.com',
      name: 'Carol Davis',
      wallet: {
        create: {
          balance: 10,
          totalPurchased: 20,
          totalUsed: 13,
        },
      },
    },
  });

  // Sample research for User 3
  const research1 = await prisma.research.create({
    data: {
      userId: user3.id,
      title: 'AI-powered fitness app',
      inputIdea: 'An app that uses AI to create personalized workout plans',
      status: 'completed',
      currentEngine: 7,
      confidenceScore: 85.5,
      results: {
        engines: [
          { name: 'Market Demand', score: 90, findings: 'High search volume' },
          { name: 'Willingness to Pay', score: 85, findings: 'Premium pricing viable' },
          { name: 'Ability to Pay', score: 80, findings: 'Target market affluent' },
          { name: 'Buildable', score: 87, findings: 'Tech stack available' },
        ],
      },
      completedAt: new Date(),
    },
  });

  // Sample transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: user3.id,
        type: 'purchase',
        credits: 20,
        stripePaymentId: 'pi_test_123456',
      },
      {
        userId: user3.id,
        type: 'usage',
        credits: -1,
        researchId: research1.id,
      },
      {
        userId: user2.id,
        type: 'usage',
        credits: -3,
      },
    ],
  });

  console.log('✅ Seed completed successfully');
  console.log(`   - Created 3 users`);
  console.log(`   - Created 1 research session`);
  console.log(`   - Created 3 transactions`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Implementation Tasks

### Phase 1: Local Development Setup (2 hours)
- [ ] Create `docker-compose.yml`
- [ ] Create `.env.local` template
- [ ] Start PostgreSQL container
- [ ] Verify connection with `psql`
- [ ] Document startup commands

### Phase 2: Prisma Configuration (2 hours)
- [ ] Install Prisma dependencies (`npm install prisma @prisma/client`)
- [ ] Initialize Prisma (`npx prisma init`)
- [ ] Create `schema.prisma` with all models
- [ ] Generate Prisma Client (`npx prisma generate`)
- [ ] Create initial migration (`npx prisma migrate dev`)

### Phase 3: Database Utilities (1.5 hours)
- [ ] Create `src/lib/db/client.ts` with retry wrapper
- [ ] Add connection health check
- [ ] Create `src/lib/db/index.ts` for exports
- [ ] Add TypeScript types for JSON fields
- [ ] Unit tests for retry logic

### Phase 4: Seed Script (1 hour)
- [ ] Create `prisma/seed.ts`
- [ ] Add seed command to `package.json`
- [ ] Run seed script (`npx prisma db seed`)
- [ ] Verify data in pgAdmin

### Phase 5: Neon Production Setup (1.5 hours)
- [ ] Create Neon project at neon.tech
- [ ] Configure connection pooler
- [ ] Create `.env.production` template
- [ ] Test connection from local
- [ ] Document migration to production

### Phase 6: Documentation (1 hour)
- [ ] Create `docs/DATABASE_SETUP.md`
- [ ] Document migration workflow
- [ ] Add troubleshooting guide
- [ ] Update README with database setup

---

## Environment Variables

### `.env.local` (Development)
```bash
# Database
DATABASE_URL="postgresql://curatos:curatos_dev_password@localhost:5432/curatos_dev"

# Prisma
PRISMA_GENERATE_DATAPROXY="false"
```

### `.env.production` (Production)
```bash
# Neon Database with Connection Pooler
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true"

# Direct connection (for migrations only)
DIRECT_DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# Prisma
PRISMA_GENERATE_DATAPROXY="false"
```

---

## Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "db:start": "docker-compose up -d",
    "db:stop": "docker-compose down",
    "db:reset": "docker-compose down -v && docker-compose up -d",
    "db:migrate": "npx prisma migrate dev",
    "db:migrate:prod": "npx prisma migrate deploy",
    "db:seed": "npx prisma db seed",
    "db:studio": "npx prisma studio",
    "db:generate": "npx prisma generate"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## Migration Workflow

### Development
```bash
# 1. Start local database
npm run db:start

# 2. Create migration
npx prisma migrate dev --name init

# 3. Seed database
npm run db:seed

# 4. Open Prisma Studio
npm run db:studio
```

### Production
```bash
# 1. Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# 2. Run migrations
npm run db:migrate:prod

# 3. Verify with Prisma Studio (read-only)
npm run db:studio
```

---

## Testing Strategy

### Manual Testing
1. Start Docker containers
2. Run migrations
3. Seed database
4. Query data via Prisma Studio
5. Test retry wrapper with connection failures
6. Verify Neon connection

### Automated Testing
```typescript
// Example test
describe('Database Client', () => {
  it('should retry on connection failure', async () => {
    const client = getDbClient();
    const result = await client.withRetry(() => 
      prisma.user.findMany()
    );
    expect(result).toBeDefined();
  });
});
```

---

## Success Metrics

- ✅ Local database starts with one command
- ✅ All migrations run without errors
- ✅ Seed script creates test data
- ✅ Retry wrapper handles cold starts
- ✅ Neon connection works in production
- ✅ Zero database connection errors in first week

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Neon cold start latency | Medium | Connection pooler + retry wrapper |
| Migration conflicts | High | Version control migrations, test locally first |
| Data loss during development | Low | Docker volumes persist data |
| Connection pool exhaustion | Medium | Configure max connections in Neon |

---

## Neon Configuration

### Connection Pooler Setup
1. Create project at [neon.tech](https://neon.tech)
2. Enable connection pooler in project settings
3. Use pooled connection string for app
4. Use direct connection string for migrations only

### Recommended Settings
- **Connection pooler:** Enabled (PgBouncer)
- **Pool mode:** Transaction
- **Max connections:** 100 (adjust based on usage)
- **Auto-suspend:** 5 minutes (free tier)

---

## Documentation Updates

After completion, create/update:
1. `docs/DATABASE_SETUP.md` - Complete setup guide
2. `README.md` - Add database setup section
3. `.kiro/DEVLOG.md` - Log decisions and issues
4. `prisma/README.md` - Migration and seed instructions

---

## Dependencies

- Docker Desktop (for local PostgreSQL)
- Node.js 18+ (for Prisma CLI)
- Neon account (free tier sufficient)
- PostgreSQL client (optional, for debugging)

---

## Follow-up Stories

- **Database Backups:** Automated backups for production
- **Query Optimization:** Add indexes based on usage patterns
- **Audit Logging:** Track all database changes
- **Data Analytics:** Set up read replicas for reporting

---

## Notes

- Neon free tier includes 0.5 GB storage, 3 GB data transfer
- Connection pooler essential for serverless deployments
- Use `DIRECT_DATABASE_URL` for migrations only
- Prisma Client regenerates on schema changes
- Consider Prisma Accelerate for global edge caching

---

**Created:** 2026-01-13  
**Last Updated:** 2026-01-13
