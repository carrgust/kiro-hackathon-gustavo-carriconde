import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/client';
import { PILLARS, calculateOverallScore, calculatePillarScore } from '@/lib/validation/config';
import { searchAndAnalyzeSource, calculateSubcategoryScore } from '@/lib/validation/source-searcher';
import { getApisForPillar } from '@/lib/validation/registry-loader';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const prisma = getPrisma();

  try {
    const { idea, canonicalDescription, geography } = await request.json();

    if (!idea || idea.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a business idea (at least 3 characters)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server not configured - no API key' },
        { status: 500 }
      );
    }

    const session = await prisma.validationSession.create({
      data: {
        originalInput: idea.trim(),
        canonicalDescription: canonicalDescription || idea.trim(),
        status: 'running',
        pillars: {
          create: PILLARS.map(pillar => ({
            pillarKey: pillar.key,
            pillarName: pillar.name,
            pillarIcon: pillar.icon,
            pillarWeight: pillar.weight,
            status: 'pending',
            subcategories: {
              create: pillar.subcategories.map(sub => ({
                subcategoryKey: sub.key,
                subcategoryName: sub.name,
                status: 'pending',
                sources: {
                  create: getApisForPillar(pillar.key).map(api => ({
                    sourceType: api.id,
                    sourceIcon: api.icon,
                    sourceColor: api.color,
                    sourceName: api.shortName,
                    status: 'pending'
                  }))
                }
              }))
            }
          }))
        }
      },
      include: {
        pillars: {
          include: {
            subcategories: {
              include: {
                sources: true
              }
            }
          }
        }
      }
    });

    processValidation(session.id, canonicalDescription || idea.trim(), geography || 'Global').catch(console.error);

    return NextResponse.json({
      sessionId: session.id,
      status: 'running',
      idea: session.originalInput
    });

  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processValidation(sessionId: string, canonicalDescription: string, geography: string) {
  console.log('[DEBUG] processValidation started for session:', sessionId);
  const prisma = getPrisma();

  const pillarPromises = PILLARS.map(pillar =>
    processPillar(sessionId, pillar, canonicalDescription, geography)
  );

  await Promise.all(pillarPromises);

  const pillars = await prisma.pillarResult.findMany({
    where: { sessionId, status: 'complete' }
  });

  if (pillars.length === PILLARS.length) {
    const scores = pillars.map(p => ({ key: p.pillarKey, score: p.score! }));
    const overallScore = calculateOverallScore(scores);

    await prisma.validationSession.update({
      where: { id: sessionId },
      data: { overallScore, status: 'complete', completedAt: new Date() }
    });
  }
}

async function processPillar(
  sessionId: string,
  pillarConfig: typeof PILLARS[0],
  canonicalDescription: string,
  geography: string
) {
  console.log('[DEBUG] processPillar started for pillar:', pillarConfig.key, 'session:', sessionId);
  const prisma = getPrisma();

  const pillar = await prisma.pillarResult.findFirst({
    where: { sessionId, pillarKey: pillarConfig.key }
  });

  if (!pillar) return;

  await prisma.pillarResult.update({
    where: { id: pillar.id },
    data: { status: 'running' }
  });

  const subcategoryPromises = pillarConfig.subcategories.map(subConfig =>
    processSubcategory(pillar.id, pillarConfig.key, subConfig, canonicalDescription, geography)
  );

  const subcategoryScores = await Promise.all(subcategoryPromises);

  const pillarScore = calculatePillarScore(subcategoryScores.filter(s => s > 0));

  await prisma.pillarResult.update({
    where: { id: pillar.id },
    data: { score: pillarScore, status: 'complete' }
  });
}

async function processSubcategory(
  pillarId: string,
  pillarKey: string,
  subConfig: { key: string; name: string; prompt: string },
  canonicalDescription: string,
  geography: string
): Promise<number> {
  console.log('[DEBUG] processSubcategory started for:', pillarKey, '/', subConfig.key);
  const prisma = getPrisma();

  const subcategory = await prisma.subcategoryResult.findFirst({
    where: { pillarId, subcategoryKey: subConfig.key }
  });

  if (!subcategory) return 0;

  await prisma.subcategoryResult.update({
    where: { id: subcategory.id },
    data: { status: 'running' }
  });

  const apis = getApisForPillar(pillarKey);
  const sourcePromises = apis.map(async (api) => {
    const result = await searchAndAnalyzeSource(
      canonicalDescription, pillarKey, subConfig.key, api.id, geography
    );

    await prisma.sourceResult.updateMany({
      where: { subcategoryId: subcategory.id, sourceType: api.id },
      data: {
        status: result.status,
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        publishedDate: result.publishedDate,
        relevanceScore: result.relevanceScore,
        supports: result.supports || [],
        concerns: result.concerns || [],
        impactOnScore: result.impactOnScore,
        confidence: result.confidence
      }
    });

    return result;
  });

  const sources = await Promise.all(sourcePromises);

  const score = await calculateSubcategoryScore(
    canonicalDescription, pillarKey, subConfig.key, sources, geography
  );

  await prisma.subcategoryResult.update({
    where: { id: subcategory.id },
    data: { score, status: 'complete' }
  });

  return score;
}
