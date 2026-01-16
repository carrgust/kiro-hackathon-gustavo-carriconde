import { NextRequest, NextResponse } from 'next/server';
import { createResearchAgent } from '@/lib/api/research-agent';

export async function POST(request: NextRequest) {
  try {
    const { hypothesis, apiKey } = await request.json();
    
    if (!hypothesis) {
      return NextResponse.json({ error: 'Hypothesis required' }, { status: 400 });
    }
    
    const key = apiKey || process.env.OPENROUTER_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }
    
    const agent = createResearchAgent(key, process.env.SERPER_API_KEY);
    const result = await agent.research(hypothesis);
    
    return NextResponse.json({
      sources: result.sources,
      confidence: result.confidence,
      reasoning: result.reasoning
    });
  } catch (error) {
    console.error('Research agent error:', error);
    return NextResponse.json({ error: 'Research failed' }, { status: 500 });
  }
}
