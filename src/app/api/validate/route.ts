import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ valid: false, error: 'Server not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false, error: 'Invalid API key' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Connection failed' }, { status: 500 });
  }
}
