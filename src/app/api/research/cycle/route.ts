import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/client';
import { buildAgentContext } from '@/lib/orchestrator/context-builder';
import { AgentAction } from '@/types/orchestrator';
import { HypothesisService } from '@/lib/api/hypothesis';
import { EngineState, Hypothesis } from '@/types/project';

// Force dynamic rendering (no static optimization)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LOCK_ID = 999999; // PostgreSQL advisory lock ID for cycle execution

export async function POST(request: NextRequest) {
  const prisma = getPrisma();
  let lockAcquired = false;

  try {
    const { sessionId, niche } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server not configured - no API key' }, { status: 500 });
    }

    // Acquire advisory lock to prevent concurrent cycles
    const lockResult = await prisma.$queryRaw<[{ pg_try_advisory_lock: boolean }]>`
      SELECT pg_try_advisory_lock(${LOCK_ID})
    `;
    lockAcquired = lockResult[0]?.pg_try_advisory_lock || false;

    if (!lockAcquired) {
      return NextResponse.json({ 
        error: 'Cycle already in progress',
        nextCycleIn: 5000 
      }, { status: 409 });
    }

    // Load or create session
    let session = sessionId 
      ? await prisma.continuousSession.findUnique({ where: { id: sessionId } })
      : null;

    if (!session && niche) {
      session = await prisma.continuousSession.create({
        data: {
          niche,
          enabled: true,
          pipelineState: {
            niche,
            nicheLocked: true,
            hypotheses: [],
            solutions: [],
            requirements: [],
            slider: 60,
            tokensUsed: 0,
            agentRationale: []
          }
        }
      });
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Parse pipeline state
    const state = session.pipelineState as any as EngineState;

    // Log cycle start
    await prisma.sessionEvent.create({
      data: {
        sessionId: session.id,
        eventType: 'cycle_start',
        metadata: { timestamp: new Date().toISOString() }
      }
    });

    // Build agent context
    const context = buildAgentContext(state);

    // Call orchestrator to decide next action
    const orchestrateResponse = await fetch(`${request.nextUrl.origin}/api/agent/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    });

    if (!orchestrateResponse.ok) {
      throw new Error('Orchestrator failed');
    }

    const { thought, action, parameters } = await orchestrateResponse.json();

    // Initialize hypothesis service
    const hypothesisService = new HypothesisService(apiKey);

    // Execute the action
    let updatedState = { ...state };
    let cardId: string | undefined;
    let cardType: string | undefined;
    let confidence: number | undefined;

    switch (action) {
      case AgentAction.GENERATE_PROBLEM: {
        const newProblems = await hypothesisService.generateHypotheses(state.niche, 'problems', 1);
        if (newProblems.length > 0) {
          updatedState.hypotheses = [...state.hypotheses, { ...newProblems[0], status: 'pending' }];
          cardId = newProblems[0].id;
          cardType = 'problem';
        }
        break;
      }

      case AgentAction.GENERATE_SOLUTION: {
        if (parameters?.problemId) {
          const problem = state.hypotheses.find(h => h.id === parameters.problemId);
          if (problem) {
            const newSolutions = await hypothesisService.generateSolutionForProblem(
              state.niche,
              problem.text,
              problem.id
            );
            if (newSolutions.length > 0) {
              updatedState.solutions = [...state.solutions, { ...newSolutions[0], status: 'pending' }];
              cardId = newSolutions[0].id;
              cardType = 'solution';
            }
          }
        }
        break;
      }

      case AgentAction.GENERATE_REQUIREMENT: {
        if (parameters?.solutionId) {
          const solution = state.solutions.find(s => s.id === parameters.solutionId);
          if (solution) {
            const newReqs = await hypothesisService.generateRequirementForSolution(
              state.niche,
              solution.text,
              solution.id
            );
            if (newReqs.length > 0) {
              updatedState.requirements = [...state.requirements, { ...newReqs[0], status: 'pending' }];
              cardId = newReqs[0].id;
              cardType = 'requirement';
            }
          }
        }
        break;
      }

      case AgentAction.RESEARCH_CARD: {
        if (parameters?.cardId) {
          const allCards = [...state.hypotheses, ...state.solutions, ...state.requirements];
          const card = allCards.find(c => c.id === parameters.cardId);
          
          if (card) {
            const column = state.hypotheses.some(h => h.id === card.id) ? 'hypotheses' :
                          state.solutions.some(s => s.id === card.id) ? 'solutions' : 'requirements';
            
            const result = await hypothesisService.researchHypothesis(
              card,
              state.niche,
              column === 'hypotheses'
            );

            const isFact = result.confidence >= 90;
            const updatedCard = {
              ...card,
              state: isFact ? 'fact' as const : 'hypothesis' as const,
              confidence: result.confidence,
              sources: result.sources,
              status: 'complete' as const
            };

            updatedState[column] = state[column].map(h => 
              h.id === card.id ? updatedCard : h
            );

            cardId = card.id;
            cardType = column.slice(0, -1); // Remove 's' suffix
            confidence = result.confidence;
          }
        }
        break;
      }

      case AgentAction.THINK:
      case AgentAction.WAIT:
      default:
        // No action needed
        break;
    }

    // Update session in database
    const updatedSession = await prisma.continuousSession.update({
      where: { id: session.id },
      data: {
        pipelineState: updatedState as any,
        lastCycleAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Log cycle completion
    await prisma.sessionEvent.create({
      data: {
        sessionId: session.id,
        eventType: 'cycle_complete',
        agentAction: action,
        cardType,
        cardId,
        confidence,
        metadata: { thought, parameters }
      }
    });

    // Release lock
    await prisma.$queryRaw`SELECT pg_advisory_unlock(${LOCK_ID})`;
    lockAcquired = false;

    return NextResponse.json({
      sessionId: session.id,
      state: updatedState,
      action,
      thought,
      nextCycleIn: session.cycleInterval
    });

  } catch (error: any) {
    console.error('Cycle execution error:', error);

    // Log error event if we have a session
    try {
      const { sessionId } = await request.json();
      if (sessionId) {
        await prisma.sessionEvent.create({
          data: {
            sessionId,
            eventType: 'cycle_error',
            errorMessage: error.message,
            metadata: { stack: error.stack }
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log error event:', logError);
    }

    return NextResponse.json(
      { error: error.message || 'Cycle execution failed' },
      { status: 500 }
    );
  } finally {
    // Always release lock if acquired
    if (lockAcquired) {
      try {
        await prisma.$queryRaw`SELECT pg_advisory_unlock(${LOCK_ID})`;
      } catch (unlockError) {
        console.error('Failed to release advisory lock:', unlockError);
      }
    }
  }
}
