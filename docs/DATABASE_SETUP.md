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
