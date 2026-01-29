import { NextRequest, NextResponse } from 'next/server';
import { callWithFallback } from '@/lib/validation/model-client';

const BUSINESS_PLAN_PROMPT = `You are a business plan expert. Generate a concise, investor-ready business plan in JSON format.

CRITICAL: Return ONLY valid JSON with exactly 4 keys: executive_summary, market_and_sales, team_and_operations, financial_plan.

STRICT RULES:
- Each section: 200-250 words MAX
- Use bullet points with - prefix
- Use **bold** for key terms and numbers
- Be specific with numbers (TAM, pricing, projections, etc.)
- No fluff - investors want data

JSON STRUCTURE:
{
  "executive_summary": "Concept, problem, solution, market size, competitive advantage, financial highlights (200-250 words)",
  "market_and_sales": "TAM/SAM/SOM breakdown, competition analysis, go-to-market channels, pricing strategy (200-250 words)",
  "team_and_operations": "Founder background, team composition, product delivery plan, tech stack, 12-month milestones (200-250 words)",
  "financial_plan": "Revenue model, 3-year projections (Y1/Y2/Y3 revenue), unit economics, breakeven timeline, key risks (200-250 words)"
}

Each section must be markdown-formatted text with bullet points and bold numbers.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, canonicalDescription, pillars, gapAnalysis, improvedIdea } = body;

    if (!idea || !improvedIdea) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('[GenerateBusinessPlan] Starting generation...');

    // Build context from all data
    const context = `
BUSINESS IDEA: ${idea}

CANONICAL DESCRIPTION: ${canonicalDescription || 'N/A'}

IMPROVED IDEA (7 PILLARS):
${Object.entries(improvedIdea).map(([key, value]) => `**${key.toUpperCase()}**: ${value}`).join('\n\n')}

VALIDATION SCORES:
${pillars?.map((p: any) => `- ${p.name}: ${p.score}/100`).join('\n') || 'N/A'}

${gapAnalysis && gapAnalysis.length > 0 ? `
GAP ANALYSIS:
${gapAnalysis.map((g: any) => `- ${g.pillarName} (${g.priority}): ${g.diagnosis}`).join('\n')}
` : ''}

Generate a comprehensive business plan based on this validated data.
`;

    const response = await callWithFallback(
      apiKey,
      [
        { role: 'system', content: BUSINESS_PLAN_PROMPT },
        { role: 'user', content: context }
      ],
      { maxTokens: 4096, temperature: 0.4, jsonMode: true }
    );

    console.log('[GenerateBusinessPlan] Response received, parsing JSON...');

    // Parse and validate JSON
    let businessPlan;
    try {
      businessPlan = JSON.parse(response);
    } catch (parseError) {
      console.error('[GenerateBusinessPlan] JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse business plan JSON' },
        { status: 500 }
      );
    }

    // Validate all 4 keys exist
    const requiredKeys = ['executive_summary', 'market_and_sales', 'team_and_operations', 'financial_plan'];
    const missingKeys = requiredKeys.filter(key => !businessPlan[key]);
    
    if (missingKeys.length > 0) {
      console.error('[GenerateBusinessPlan] Missing keys:', missingKeys);
      return NextResponse.json(
        { error: `Missing required sections: ${missingKeys.join(', ')}` },
        { status: 500 }
      );
    }

    console.log('[GenerateBusinessPlan] Business plan generated successfully');

    return NextResponse.json({ businessPlan });

  } catch (error: any) {
    console.error('[GenerateBusinessPlan] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate business plan' },
      { status: 500 }
    );
  }
}
