import { NextRequest, NextResponse } from 'next/server';
import { NORMALIZER_PROMPT } from '@/lib/validation/prompts';
import { callWithFallback } from '@/lib/validation/model-client';
import { stripCodeFences } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userInput, geography = 'Global', previousIdeas = [] } = await req.json();

    if (!userInput || userInput.trim().length < 3) {
      return NextResponse.json(
        { error: 'User input must be at least 3 characters' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server not configured - no API key' },
        { status: 500 }
      );
    }

    const exclusion = previousIdeas.length > 0
      ? '\n\nPREVIOUSLY GENERATED IDEAS (DO NOT REPEAT THESE — generate a COMPLETELY DIFFERENT business concept):\n' +
        previousIdeas.map((idea: string, i: number) => `${i + 1}. ${idea}`).join('\n')
      : '';

    const prompt = NORMALIZER_PROMPT
      .replace('{user_input}', userInput)
      .replace('{geography}', geography)
      .replace('{exclusion}', exclusion);
    
    console.log('[Normalize] Prompt length:', prompt.length);
    console.log('[Normalize] First 200 chars:', prompt.substring(0, 200));

    const response = await callWithFallback(
      apiKey,
      [{ role: 'user', content: prompt }],
      { temperature: previousIdeas.length > 0 ? 0.95 : 0.7, maxTokens: 2500, jsonMode: true }
    );
    
    console.log('[Normalize] Response length:', response?.length || 0);
    console.log('[Normalize] Response preview:', response?.substring(0, 200) || 'EMPTY');

    if (!response || response.trim().length === 0) {
      return NextResponse.json(
        { error: 'No response from AI model (empty response)' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let analysis: Record<string, string>;
    try {
      analysis = JSON.parse(stripCodeFences(response));
      
      // Validate required fields
      const requiredFields = ['problem', 'market', 'competition', 'solution', 'monetization', 'gtm', 'timing'];
      const missingFields = requiredFields.filter(field => !analysis[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response:', response);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON', details: parseError instanceof Error ? parseError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      original: userInput,
      analysis,
    });
  } catch (error) {
    console.error('Normalize API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
