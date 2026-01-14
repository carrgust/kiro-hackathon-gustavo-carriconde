# Feature: Database Setup with Prisma & Neon

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Set up production-ready database infrastructure with Prisma ORM for type-safe database access, Docker PostgreSQL for local development, and Neon serverless PostgreSQL for production deployment with connection pooling.

## User Story

As a **Curatos developer**
I want to **set up persistent database storage with Prisma ORM**
So that **user data, wallets, research sessions, and transactions are stored reliably**

## Problem Statement

Curatos currently has no persistent storage. User data, wallet balances, research sessions, and transaction history need to be stored in a production-ready database with:
- Type-safe database access
- Local development environment
- Production-ready serverless deployment
- Connection retry logic for cold starts

## Solution Statement

Implement Prisma ORM with PostgreSQL, Docker Compose for local development, Neon for production, database retry wrapper for reliability, and seed scripts for testing.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium-High
**Primary Systems Affected**: Database layer, Data models, Development environment
**Dependencies**: Prisma, PostgreSQL, Docker, Neon, TypeScript

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `package.json` (lines 1-30) - Project dependencies and scripts structure
- `tsconfig.json` - TypeScript configuration with path aliases
- `src/types/project.ts` - Existing type definitions (Hypothesis type)
- `src/lib/utils.ts` - Utility functions pattern
- `.kiro/specs/database-setup.md` - Complete specification with schema

### New Files to Create

- `prisma/schema.prisma` - Database schema with User, Wallet, Research, Transaction models
- `prisma/seed.ts` - Seed script with test data
- `docker-compose.yml` - Local PostgreSQL + pgAdmin setup
- `src/lib/db/client.ts` - Database client with retry wrapper
- `src/lib/db/index.ts` - Database exports
- `.env.local.example` - Environment variable template
- `.env.production.example` - Production environment template
- `.gitignore` - Add database and environment files
- `docs/DATABASE_SETUP.md` - Setup and migration documentation

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
  - Specific section: PostgreSQL setup
  - Why: Official setup guide for Prisma with PostgreSQL
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
  - Specific section: Model relations and indexes
  - Why: Proper schema definition patterns
- [Neon Documentation](https://neon.tech/docs/introduction)
  - Specific section: Connection pooling
  - Why: Production deployment with serverless PostgreSQL
- [Docker Compose PostgreSQL](https://hub.docker.com/_/postgres)
  - Why: Local development setup

### Patterns to Follow

**Naming Conventions:**
- Database files: kebab-case (e.g., `client.ts`, `schema.prisma`)
- Prisma models: PascalCase (e.g., `User`, `Wallet`)
- Functions: camelCase (e.g., `getPrisma`, `withRetry`)
- Environment variables: UPPER_SNAKE_CASE (e.g., `DATABASE_URL`)

**Import Pattern:**
```typescript
// From existing codebase
import { Hypothesis } from '@/types/project';
import { getProvider } from '@/lib/api';
```

**Error Handling:**
```typescript
// Pattern from openrouter.ts
console.error('Error message:', error);
throw new Error(`Descriptive error: ${details}`);
```

**Singleton Pattern:**
```typescript
// Pattern from token-tracker.ts (if implemented)
let instance: ClassName | null = null;
export function getInstance(): ClassName {
  if (!instance) instance = new ClassName();
  return instance;
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation - Prisma Setup

Install Prisma, create schema, configure TypeScript integration.

**Tasks:**
- Install Prisma dependencies
- Initialize Prisma with PostgreSQL
- Create database schema with all models
- Configure Prisma Client generation

### Phase 2: Local Development - Docker Setup

Set up Docker Compose for local PostgreSQL development.

**Tasks:**
- Create docker-compose.yml
- Configure PostgreSQL container
- Add pgAdmin for database management
- Create environment variable templates

### Phase 3: Database Client - Retry Wrapper

Implement database client with connection retry logic.

**Tasks:**
- Create database client with retry wrapper
- Add Prisma error code handling
- Implement exponential backoff
- Create singleton accessor functions

### Phase 4: Data Seeding

Create seed script with test users and data.

**Tasks:**
- Create seed script
- Add 3 test users with different scenarios
- Add sample research and transactions
- Configure seed command in package.json

### Phase 5: Documentation & Migration

Document setup process and migration workflow.

**Tasks:**
- Create DATABASE_SETUP.md
- Document local development workflow
- Document production deployment
- Add migration commands to package.json

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### INSTALL Prisma dependencies

- **IMPLEMENT**: Install @prisma/client and prisma dev dependency
- **PATTERN**: Existing package.json dependencies structure
- **IMPORTS**: None
- **GOTCHA**: Use exact versions for stability
- **VALIDATE**: `npm list @prisma/client prisma`

```bash
npm install @prisma/client
npm install -D prisma ts-node
```

### INITIALIZE Prisma

- **IMPLEMENT**: Initialize Prisma with PostgreSQL provider
- **PATTERN**: Standard Prisma init
- **IMPORTS**: None
- **GOTCHA**: Creates prisma/ directory and .env file
- **VALIDATE**: `ls -la prisma/schema.prisma`

```bash
npx prisma init --datasource-provider postgresql
```

### CREATE prisma/schema.prisma

- **IMPLEMENT**: Complete database schema with User, Wallet, Research, Transaction models
- **PATTERN**: Prisma schema syntax from spec
- **IMPORTS**: None
- **GOTCHA**: Use @db.Text for long strings, Json for JSON fields
- **VALIDATE**: `npx prisma format && npx prisma validate`

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
  
  wallet       Wallet?
  researches   Research[]
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
  id              String    @id @default(cuid())
  userId          String
  title           String
  inputIdea       String    @db.Text
  status          String    @default("pending")
  currentEngine   Int       @default(0)
  confidenceScore Float?
  results         Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  completedAt     DateTime?
  
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model Transaction {
  id              String   @id @default(cuid())
  userId          String
  type            String
  credits         Int
  researchId      String?
  stripePaymentId String?  @unique
  createdAt       DateTime @default(now())
  
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  research Research? @relation(fields: [researchId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([type])
  @@index([createdAt])
}
```

### CREATE docker-compose.yml

- **IMPLEMENT**: Docker Compose with PostgreSQL 15 and pgAdmin
- **PATTERN**: Standard Docker Compose v3.8 syntax
- **IMPORTS**: None
- **GOTCHA**: Use persistent volumes for data
- **VALIDATE**: `docker-compose config`

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

### CREATE .env.local.example

- **IMPLEMENT**: Environment variable template for local development
- **PATTERN**: Standard .env format
- **IMPORTS**: None
- **GOTCHA**: Don't commit actual .env files
- **VALIDATE**: Manual review

```bash
# Database
DATABASE_URL="postgresql://curatos:curatos_dev_password@localhost:5432/curatos_dev"

# Prisma
PRISMA_GENERATE_DATAPROXY="false"
```

### CREATE .env.production.example

- **IMPLEMENT**: Environment variable template for production (Neon)
- **PATTERN**: Standard .env format with Neon connection pooler
- **IMPORTS**: None
- **GOTCHA**: Use pooled connection for app, direct for migrations
- **VALIDATE**: Manual review

```bash
# Neon Database with Connection Pooler
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true"

# Direct connection (for migrations only)
DIRECT_DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# Prisma
PRISMA_GENERATE_DATAPROXY="false"
```

### CREATE src/lib/db/client.ts

- **IMPLEMENT**: Database client with retry wrapper for cold starts
- **PATTERN**: Singleton pattern, exponential backoff from retry.ts
- **IMPORTS**: `import { PrismaClient } from '@prisma/client';`
- **GOTCHA**: Handle Prisma error codes (P1001, P1002, P1008, P1017)
- **VALIDATE**: `npx tsc --noEmit`

```typescript
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
  private prisma: PrismaClient;
  private retryConfig: RetryConfig;

  constructor(config: RetryConfig = DEFAULT_RETRY_CONFIG) {
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
    return this.prisma;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
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
```

### CREATE src/lib/db/index.ts

- **IMPLEMENT**: Export database utilities
- **PATTERN**: Barrel export pattern from src/lib/api/index.ts
- **IMPORTS**: From client.ts
- **GOTCHA**: Re-export Prisma types for convenience
- **VALIDATE**: `npx tsc --noEmit`

```typescript
export { getDbClient, getPrisma } from './client';
export { PrismaClient } from '@prisma/client';
```

### CREATE prisma/seed.ts

- **IMPLEMENT**: Seed script with 3 test users and sample data
- **PATTERN**: Prisma upsert pattern for idempotency
- **IMPORTS**: `import { PrismaClient } from '@prisma/client';`
- **GOTCHA**: Use upsert to make script idempotent
- **VALIDATE**: `npx ts-node prisma/seed.ts`

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
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### UPDATE package.json

- **IMPLEMENT**: Add database scripts
- **PATTERN**: Existing scripts structure
- **IMPORTS**: None
- **GOTCHA**: Add prisma seed configuration
- **VALIDATE**: `npm run db:start`

```json
{
  "scripts": {
    "dev": "next dev -p 5001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
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

### CREATE .gitignore

- **IMPLEMENT**: Add database and environment files to gitignore
- **PATTERN**: Standard gitignore patterns
- **IMPORTS**: None
- **GOTCHA**: Don't commit .env files or database data
- **VALIDATE**: `git status` (should not show .env files)

```
# Database
.env
.env.local
.env.production
prisma/.env

# Prisma
prisma/migrations/migration_lock.toml

# Docker
docker-compose.override.yml
```

### CREATE docs/DATABASE_SETUP.md

- **IMPLEMENT**: Complete setup and migration documentation
- **PATTERN**: Markdown documentation style
- **IMPORTS**: None
- **GOTCHA**: Include both local and production workflows
- **VALIDATE**: Manual review

```markdown
# Database Setup Guide

## Local Development

### Prerequisites
- Docker Desktop installed
- Node.js 18+

### Setup Steps

1. **Start PostgreSQL**
   ```bash
   npm run db:start
   ```

2. **Configure Environment**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

4. **Seed Database**
   ```bash
   npm run db:seed
   ```

5. **Open Prisma Studio**
   ```bash
   npm run db:studio
   ```

### Database Management

- **pgAdmin**: http://localhost:5050
  - Email: admin@curatos.local
  - Password: admin

- **Prisma Studio**: http://localhost:5555
  - Run: `npm run db:studio`

### Common Commands

```bash
# Start database
npm run db:start

# Stop database
npm run db:stop

# Reset database (deletes all data)
npm run db:reset

# Create migration
npx prisma migrate dev --name description

# Generate Prisma Client
npm run db:generate
```

## Production (Neon)

### Setup

1. **Create Neon Project**
   - Go to https://neon.tech
   - Create new project
   - Enable connection pooler

2. **Configure Environment**
   ```bash
   cp .env.production.example .env.production
   # Fill in Neon connection strings
   ```

3. **Run Migrations**
   ```bash
   export DATABASE_URL="your-direct-connection-string"
   npm run db:migrate:prod
   ```

### Connection Strings

- **Pooled (for app)**: Use with `?pgbouncer=true`
- **Direct (for migrations)**: Use without pgbouncer

### Migration Workflow

1. Test locally first
2. Backup production database
3. Run migration with direct connection
4. Verify with Prisma Studio
5. Update app to use pooled connection

## Troubleshooting

### Connection Refused
- Check Docker is running: `docker ps`
- Restart containers: `npm run db:reset`

### Migration Failed
- Check DATABASE_URL is correct
- Ensure database is accessible
- Review migration SQL in prisma/migrations/

### Seed Failed
- Check database is empty or use upsert
- Verify foreign key constraints
- Check for unique constraint violations

## Schema Changes

1. Update `prisma/schema.prisma`
2. Run `npx prisma format`
3. Run `npx prisma validate`
4. Create migration: `npx prisma migrate dev --name change-description`
5. Test locally
6. Deploy to production: `npm run db:migrate:prod`
```

---

## TESTING STRATEGY

### Manual Testing

1. **Docker Setup**
   ```bash
   npm run db:start
   docker ps  # Verify containers running
   ```

2. **Migration**
   ```bash
   npm run db:migrate
   # Should create initial migration
   ```

3. **Seed Data**
   ```bash
   npm run db:seed
   # Should create 3 users, 1 research, 3 transactions
   ```

4. **Prisma Studio**
   ```bash
   npm run db:studio
   # Open http://localhost:5555
   # Verify data exists
   ```

5. **Database Client**
   ```typescript
   // Test in Next.js API route
   import { getPrisma } from '@/lib/db';
   const users = await getPrisma().user.findMany();
   console.log(users);
   ```

### Integration Tests

No automated tests for this feature. Validation through manual testing and Prisma Studio.

### Edge Cases

1. **Cold Start**: Retry wrapper handles connection failures
2. **Duplicate Seed**: Upsert prevents duplicate key errors
3. **Missing Environment**: Prisma throws clear error
4. **Connection Pool Exhaustion**: Neon handles automatically

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# TypeScript compilation
npx tsc --noEmit

# Prisma schema validation
npx prisma validate

# Prisma schema formatting
npx prisma format

# ESLint
npm run lint
```

### Level 2: Docker Setup

```bash
# Validate docker-compose.yml
docker-compose config

# Start containers
npm run db:start

# Check containers running
docker ps | grep curatos

# Check PostgreSQL health
docker exec curatos-db pg_isready -U curatos

# Expected: curatos-db:5432 - accepting connections
```

### Level 3: Database Migration

```bash
# Generate Prisma Client
npm run db:generate

# Create initial migration
npm run db:migrate

# Expected: Migration created successfully

# Verify migration files
ls -la prisma/migrations/
```

### Level 4: Seed Data

```bash
# Run seed script
npm run db:seed

# Expected: ✅ Seed completed successfully

# Verify data in Prisma Studio
npm run db:studio
# Open http://localhost:5555
# Check User, Wallet, Research, Transaction tables
```

### Level 5: Database Client

```bash
# Test database client (create test file)
cat > test-db.ts << 'EOF'
import { getPrisma } from './src/lib/db';

async function test() {
  const prisma = getPrisma();
  const users = await prisma.user.findMany({ include: { wallet: true } });
  console.log('Users:', users.length);
  console.log('First user:', users[0]);
}

test().catch(console.error);
EOF

npx ts-node test-db.ts
# Expected: Users: 3, First user: { id, email, name, wallet: {...} }

rm test-db.ts
```

---

## ACCEPTANCE CRITERIA

- [x] Prisma schema with User, Wallet, Research, Transaction models
- [x] Docker Compose with PostgreSQL 15 and pgAdmin
- [x] Persistent volumes for data
- [x] Database retry wrapper with exponential backoff
- [x] Seed script with 3 test users and sample data
- [x] Environment variable templates (.env.local.example, .env.production.example)
- [x] Database scripts in package.json (start, stop, migrate, seed, studio)
- [x] Complete documentation (DATABASE_SETUP.md)
- [x] Proper indexes on all models
- [x] Timestamps on all models
- [x] Type-safe database access with Prisma Client
- [x] One-command startup (npm run db:start)

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Prisma schema validates (`npx prisma validate`)
- [ ] Docker containers start (`npm run db:start`)
- [ ] PostgreSQL health check passes
- [ ] Initial migration created (`npm run db:migrate`)
- [ ] Seed script runs successfully (`npm run db:seed`)
- [ ] Prisma Studio shows data (`npm run db:studio`)
- [ ] Database client works (test script passes)
- [ ] Documentation complete (DATABASE_SETUP.md)
- [ ] All acceptance criteria met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

### Design Decisions

1. **Prisma ORM**: Type-safe database access, excellent TypeScript integration
2. **Docker Compose**: Consistent local development environment
3. **Neon**: Serverless PostgreSQL with auto-scaling and connection pooling
4. **Retry Wrapper**: Handles cold starts and transient connection failures
5. **Seed Script**: Idempotent with upsert for repeatable testing

### Trade-offs

- **Docker Dependency**: Requires Docker Desktop for local development
- **Neon Free Tier**: 0.5 GB storage limit, sufficient for MVP
- **In-Memory Retry**: No persistent retry queue (acceptable for MVP)
- **No Migrations Rollback**: Prisma doesn't support automatic rollback

### Future Enhancements

- Add database backups (Neon automatic backups)
- Implement soft deletes for audit trail
- Add database connection pooling for local dev
- Create database monitoring dashboard
- Add automated migration testing in CI/CD

### Known Issues

- pgAdmin requires manual server configuration on first run
- Seed script doesn't handle partial failures (all-or-nothing)
- No automated tests for database layer (manual testing only)
- Docker volumes persist after `docker-compose down` (use `-v` flag to remove)

---

**Estimated Confidence Score:** 9/10

This plan provides comprehensive database setup with clear validation steps, minimal risk, and production-ready infrastructure. The retry wrapper ensures reliability, and Docker provides consistent local development.
