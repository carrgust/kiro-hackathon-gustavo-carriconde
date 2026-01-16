import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const { messages, model, models, route, provider = 'openrouter' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const aiProvider = getProvider(provider, apiKey);
    
    // Support both single model and models array with fallback route
    const options = models && route === 'fallback' 
      ? { models, route } 
      : { model };
    
    const response = await aiProvider.chat(messages, options);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
