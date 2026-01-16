import { NextRequest, NextResponse } from 'next/server';
import { fireAPIMachineGun, extractSources, formatResultsForLLM } from '@/lib/research/engines/api-machine-gun';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const result = await fireAPIMachineGun(query);
    const sources = extractSources(result);
    const formatted = formatResultsForLLM(result);

    return NextResponse.json({
      sources,
      formatted,
      stats: {
        totalSources: result.totalSources,
        successfulSources: result.successfulSources,
        totalResults: result.totalResults,
        totalTime: result.totalTime,
      }
    });
  } catch (error: any) {
    console.error('[API Machine Gun Route] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
