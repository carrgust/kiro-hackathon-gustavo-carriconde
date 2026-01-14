import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma();
    const research = await prisma.research.findUnique({
      where: { id: params.id },
    });

    if (!research) {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: research.id,
      title: research.title,
      status: research.status,
      currentEngine: research.currentEngine,
      confidenceScore: research.confidenceScore,
      results: research.results,
      createdAt: research.createdAt,
      completedAt: research.completedAt,
    });
  } catch (error) {
    console.error('[Research Status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
