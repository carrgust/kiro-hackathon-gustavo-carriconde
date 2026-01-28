import { NextRequest } from 'next/server';
import { PRIMARY_MODEL } from '@/lib/config/models';

export async function POST(request: NextRequest) {
  try {
    const { messages, model = PRIMARY_MODEL } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://curatos.app',
        'X-Title': 'Curatos DNA'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `OpenRouter error: ${response.status}` }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Forward the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return new Response(JSON.stringify({ error: 'Streaming failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
