import { NextRequest, NextResponse } from 'next/server';
import { callWithFallback } from '@/lib/validation/model-client';

const BUSINESS_PLAN_PROMPT = `You are a business plan expert. Generate a concise, investor-ready business plan in JSON format.

CRITICAL: Return ONLY valid JSON with exactly 5 keys: executive_summary, market_and_sales, team_and_operations, financial_plan, chart_data.

STRICT RULES:
- Each text section: 200-250 words MAX
- Use bullet points with - prefix
- Use **bold** for key terms and numbers
- Be specific with numbers (TAM, pricing, projections, etc.)
- No fluff - investors want data

JSON STRUCTURE:
{
  "executive_summary": "Concept, problem, solution, market size, competitive advantage, financial highlights (200-250 words)",
  "market_and_sales": "TAM/SAM/SOM breakdown, competition analysis, go-to-market channels, pricing strategy (200-250 words)",
  "team_and_operations": "Founder background, team composition, product delivery plan, tech stack, 12-month milestones (200-250 words)",
  "financial_plan": "Revenue model, 3-year projections (Y1/Y2/Y3 revenue), unit economics, breakeven timeline, key risks (200-250 words)",
  "chart_data": {
    "market_breakdown": [
      {"name": "TAM", "value": 600, "color": "#047857"},
      {"name": "SAM", "value": 150, "color": "#059669"},
      {"name": "SOM", "value": 5, "color": "#10b981"},
      {"name": "Year 1 Target", "value": 0.5, "color": "#34d399"}
    ],
    "revenue_projections": [
      {"year": "Year 1", "revenue": 5, "costs": 3},
      {"year": "Year 2", "revenue": 12, "costs": 7},
      {"year": "Year 3", "revenue": 25, "costs": 14}
    ],
    "financial_table": [
      {"metric": "Total Addressable Market (TAM)", "value": "$600B"},
      {"metric": "Serviceable Addressable Market (SAM)", "value": "$150B"},
      {"metric": "Serviceable Obtainable Market (SOM)", "value": "$5B"},
      {"metric": "Year 1 Revenue Target", "value": "$5M"},
      {"metric": "Year 3 Revenue Target", "value": "$25M"},
      {"metric": "Customer Acquisition Cost (CAC)", "value": "$500"},
      {"metric": "Lifetime Value (LTV)", "value": "$15,000"},
      {"metric": "Breakeven Timeline", "value": "24 months"}
    ]
  }
}

IMPORTANT for chart_data:
- market_breakdown: Use the actual TAM/SAM/SOM numbers from the analysis (in billions). Keep the colors as provided.
- revenue_projections: Use realistic Year 1/2/3 revenue AND cost numbers (in millions)
- financial_table: Include 6-10 rows of key financial metrics with actual values

Each text section must be markdown-formatted with bullet points and bold numbers.`;

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

Generate a comprehensive business plan with chart data based on this validated data.
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
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      businessPlan = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('[GenerateBusinessPlan] JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse business plan JSON' },
        { status: 500 }
      );
    }

    // Validate all 4 text keys exist
    const requiredKeys = ['executive_summary', 'market_and_sales', 'team_and_operations', 'financial_plan'];
    const missingKeys = requiredKeys.filter(key => !businessPlan[key]);

    if (missingKeys.length > 0) {
      console.error('[GenerateBusinessPlan] Missing keys:', missingKeys);
      return NextResponse.json(
        { error: `Missing sections: ${missingKeys.join(', ')}` },
        { status: 500 }
      );
    }

    // Ensure chart_data exists with defaults if LLM didn't provide it
    if (!businessPlan.chart_data) {
      businessPlan.chart_data = {
        market_breakdown: [
          { name: 'TAM', value: 100, color: '#047857' },
          { name: 'SAM', value: 30, color: '#059669' },
          { name: 'SOM', value: 5, color: '#10b981' },
        ],
        revenue_projections: [
          { year: 'Year 1', revenue: 5, costs: 3 },
          { year: 'Year 2', revenue: 12, costs: 7 },
          { year: 'Year 3', revenue: 25, costs: 14 },
        ],
        financial_table: [
          { metric: 'Revenue Target (Y1)', value: '$5M' },
          { metric: 'Revenue Target (Y3)', value: '$25M' },
          { metric: 'Breakeven', value: '24 months' },
        ],
      };
    }

    console.log('[GenerateBusinessPlan] Business plan generated successfully with chart data');

    return NextResponse.json({ businessPlan });

  } catch (error: any) {
    console.error('[GenerateBusinessPlan] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate business plan' },
      { status: 500 }
    );
  }
}
