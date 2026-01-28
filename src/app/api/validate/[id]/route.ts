import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/client';
import { calculateOverallScore, getScoreLabel } from '@/lib/validation/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = getPrisma();

  const session = await prisma.validationSession.findUnique({
    where: { id: params.id },
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

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const completedPillars = session.pillars.filter(p => p.score !== null);
  const currentScore = completedPillars.length > 0
    ? calculateOverallScore(completedPillars.map(p => ({ key: p.pillarKey, score: p.score! })))
    : null;

  const scoreInfo = currentScore ? getScoreLabel(currentScore) : null;

  return NextResponse.json({
    sessionId: session.id,
    idea: session.originalInput,
    canonicalDescription: session.canonicalDescription,
    status: session.status,
    overallScore: session.overallScore || currentScore,
    scoreLabel: scoreInfo?.label,
    scoreColor: scoreInfo?.color,
    completedAt: session.completedAt,
    pillars: session.pillars.map(p => ({
      key: p.pillarKey,
      name: p.pillarName,
      icon: p.pillarIcon,
      score: p.score,
      status: p.status,
      subcategories: p.subcategories.map(s => ({
        key: s.subcategoryKey,
        name: s.subcategoryName,
        score: s.score,
        status: s.status,
        sources: s.sources.map(src => ({
          type: src.sourceType,
          icon: src.sourceIcon,
          color: src.sourceColor,
          name: src.sourceName,
          status: src.status,
          title: src.title,
          url: src.url,
          snippet: src.snippet,
          relevanceScore: src.relevanceScore,
          supports: src.supports,
          concerns: src.concerns,
          confidence: src.confidence
        }))
      }))
    }))
  });
}
