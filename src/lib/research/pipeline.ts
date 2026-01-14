import { getPrisma } from '@/lib/db';
import { ProblemEngine } from './engines/problem-engine';
import { SolutionEngine } from './engines/solution-engine';
import { SynthesisEngine } from './engines/synthesis-engine';
import { PipelineStatus, PipelineResult, EngineResult } from './types';

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
    const results: EngineResult[] = [];
    const engines = [
      new ProblemEngine(this.apiKey),
      new SolutionEngine(this.apiKey),
      new SynthesisEngine(this.apiKey),
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
          data: { results: results as any },
        });
      }

      // Calculate final score from synthesis engine
      const finalScore = results[2]?.confidence || 50;

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
}
