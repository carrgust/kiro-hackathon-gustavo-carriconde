import { NextRequest, NextResponse } from 'next/server';
import { createResearchAgent } from '@/lib/api/research-agent';

export async function POST(request: NextRequest) {
  try {
    const { hypothesis } = await request.json();
    
    if (!hypothesis) {
      return NextResponse.json({ error: 'Hypothesis required' }, { status: 400 });
    }
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server not configured - no API key' }, { status: 500 });
    }
    
    const agent = createResearchAgent(apiKey, process.env.SERPER_API_KEY);
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
