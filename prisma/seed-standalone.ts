import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
