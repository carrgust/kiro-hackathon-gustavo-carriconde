import { NextResponse } from 'next/server';
import { ResearchPipeline } from '@/lib/research/pipeline';

export async function POST(request: Request) {
  try {
    const { idea, niche, apiKey } = await request.json();

    if (!idea || !niche || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: idea, niche, apiKey' },
        { status: 400 }
      );
    }

    const pipeline = new ResearchPipeline(apiKey, 'demo-user');
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
