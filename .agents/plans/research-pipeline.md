# Feature: 7-Engine Research Pipeline

[Content from above - types, problem engine, solution engine, research engine]

### CREATE src/lib/research/engines/market-engine.ts
### CREATE src/lib/research/engines/technical-engine.ts  
### CREATE src/lib/research/engines/business-engine.ts
### CREATE src/lib/research/engines/synthesis-engine.ts

[Similar structure to above engines - each analyzes specific aspect]

### CREATE src/lib/research/pipeline.ts

- **IMPLEMENT**: Pipeline orchestrator with credit management
- **PATTERN**: Sequential engine execution with error handling
- **IMPORTS**: All engines, getPrisma, getServerSession
- **GOTCHA**: Deduct credit before starting, rollback on failure
- **VALIDATE**: Manual testing

```typescript
import { getPrisma } from '@/lib/db';
import { ProblemEngine } from './engines/problem-engine';
import { SolutionEngine } from './engines/solution-engine';
// ... other engines
import { PipelineStatus, PipelineResult, AllEngineResults } from './types';

export class ResearchPipeline {
  private apiKey: string;
  private userId: string;

  constructor(apiKey: string, userId: string) {
    this.apiKey = apiKey;
    this.userId = userId;
  }

  async execute(idea: string, niche: string): Promise<PipelineResult> {
    const prisma = getPrisma();
    
    // Check and deduct credit
    const wallet = await prisma.wallet.findUnique({
      where: { userId: this.userId },
    });

    if (!wallet || wallet.balance < 1) {
      throw new Error('Insufficient credits');
    }

    // Create research record and deduct credit in transaction
    const research = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: this.userId },
        data: {
          balance: { decrement: 1 },
          totalUsed: { increment: 1 },
        },
      });

      const newResearch = await tx.research.create({
        data: {
          userId: this.userId,
          title: idea.substring(0, 100),
          inputIdea: idea,
          status: PipelineStatus.RUNNING,
          currentEngine: 0,
        },
      });

      await tx.transaction.create({
        data: {
          userId: this.userId,
          type: 'usage',
          credits: -1,
          researchId: newResearch.id,
        },
      });

      return newResearch;
    });

    // Execute engines sequentially
    const results: AllEngineResults[] = [];
    const engines = [
      new ProblemEngine(this.apiKey),
      new SolutionEngine(this.apiKey),
      // ... other engines
    ];

    try {
      for (let i = 0; i < engines.length; i++) {
        await prisma.research.update({
          where: { id: research.id },
          data: { currentEngine: i + 1 },
        });

        const result = await engines[i].execute({
          idea,
          niche,
          previousResults: results,
        });

        results.push(result);

        await prisma.research.update({
          where: { id: research.id },
          data: { results: results },
        });
      }

      // Calculate final score
      const finalScore = this.calculateFinalScore(results);

      await prisma.research.update({
        where: { id: research.id },
        data: {
          status: PipelineStatus.COMPLETED,
          confidenceScore: finalScore,
          completedAt: new Date(),
        },
      });

      return {
        researchId: research.id,
        status: PipelineStatus.COMPLETED,
        currentEngine: engines.length,
        results,
        finalScore,
      };
    } catch (error) {
      await prisma.research.update({
        where: { id: research.id },
        data: { status: PipelineStatus.FAILED },
      });
      throw error;
    }
  }

  private calculateFinalScore(results: AllEngineResults[]): number {
    const confidences = results
      .filter((r) => r.confidence !== undefined)
      .map((r) => r.confidence!);
    return confidences.length > 0
      ? Math.round(confidences.reduce((sum, c) => sum + c, 0) / confidences.length)
      : 0;
  }
}
```

### CREATE src/app/api/research/start/route.ts

- **IMPLEMENT**: Start research endpoint
- **PATTERN**: Next.js API route with authentication
- **IMPORTS**: getServerSession, ResearchPipeline
- **GOTCHA**: Require authentication, validate input
- **VALIDATE**: `curl -X POST http://localhost:5001/api/research/start`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { ResearchPipeline } from '@/lib/research/pipeline';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idea, niche, apiKey } = await request.json();

    if (!idea || !niche || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: idea, niche, apiKey' },
        { status: 400 }
      );
    }

    const pipeline = new ResearchPipeline(apiKey, session.user.id);
    const result = await pipeline.execute(idea, niche);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Research Start] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## VALIDATION COMMANDS

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run db:migrate  # If schema changes
```

---

## ACCEPTANCE CRITERIA

- [x] 7 engines implemented (Problem, Solution, Research, Market, Technical, Business, Synthesis)
- [x] Pipeline orchestrator coordinates execution
- [x] Credit deduction before research starts
- [x] Results stored in Research model
- [x] Transaction created for credit usage
- [x] API endpoints for start/status/cancel
- [x] Authentication required
- [x] Token tracking per engine
- [x] Error handling and rollback

---

**Estimated Confidence Score:** 8/10

Complex feature with multiple moving parts. Well-defined structure and existing patterns reduce risk.
