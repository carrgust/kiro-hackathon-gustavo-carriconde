import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/api';

async function tryWithKey(apiKey: string, messages: any[], options: any, keyName: string) {
  const aiProvider = getProvider('openrouter', apiKey);
  const response = await aiProvider.chat(messages, options);
  console.log(`[Chat API] Success with ${keyName}`);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model, models, route, provider = 'openrouter' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const primaryKey = process.env.OPENROUTER_API_KEY;
    const backupKey = process.env.OPENROUTER_API_KEY_BACKUP;

    if (!primaryKey && !backupKey) {
      return NextResponse.json({ error: 'Server not configured - no API keys' }, { status: 500 });
    }

    const options = models && route === 'fallback' 
      ? { models, route } 
      : { model };

    // Try primary key first
    if (primaryKey) {
      try {
        const response = await tryWithKey(primaryKey, messages, options, 'PRIMARY_KEY');
        return NextResponse.json(response);
      } catch (error: any) {
        const is401 = error?.message?.includes('401') || error?.message?.includes('User not found');
        if (!is401 || !backupKey) throw error;
        console.log('[Chat API] Primary key failed (401), trying backup...');
      }
    }

    // Fallback to backup key
    if (backupKey) {
      const response = await tryWithKey(backupKey, messages, options, 'BACKUP_KEY');
      return NextResponse.json(response);
    }

    throw new Error('All API keys exhausted');
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
