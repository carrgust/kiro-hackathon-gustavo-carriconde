import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const { messages, model, apiKey, provider = 'openrouter' } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const aiProvider = getProvider(provider, apiKey);
    const response = await aiProvider.chat(messages, model);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
