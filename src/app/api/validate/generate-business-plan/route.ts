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
    "key_metrics": [
      {"label": "TAM", "value": "$600B", "icon": "target"},
      {"label": "Year 1 Revenue", "value": "$5M", "icon": "dollar"},
      {"label": "Breakeven", "value": "24 months", "icon": "clock"},
      {"label": "LTV/CAC Ratio", "value": "30x", "icon": "trending"}
    ],
    "market_breakdown": [
      {"name": "TAM", "value": 600, "color": "#047857"},
      {"name": "SAM", "value": 150, "color": "#059669"},
      {"name": "SOM", "value": 5, "color": "#10b981"},
      {"name": "Year 1 Target", "value": 0.5, "color": "#34d399"}
    ],
    "channels": [
      {"name": "Direct Sales", "percentage": 40},
      {"name": "Partnerships", "percentage": 30},
      {"name": "Digital Marketing", "percentage": 20},
      {"name": "Referrals", "percentage": 10}
    ],
    "competitive_landscape": [
      {"name": "Innovation", "us": 90, "competitor_avg": 50},
      {"name": "Market Reach", "us": 30, "competitor_avg": 70},
      {"name": "Price Value", "us": 85, "competitor_avg": 55},
      {"name": "Technology", "us": 95, "competitor_avg": 45},
      {"name": "Support", "us": 80, "competitor_avg": 60}
    ],
    "milestones": [
      {"quarter": "Q1", "milestone": "MVP launch and beta testing"},
      {"quarter": "Q2", "milestone": "First 100 paying customers"},
      {"quarter": "Q3", "milestone": "Series A fundraise"},
      {"quarter": "Q4", "milestone": "Scale to 1,000 users"}
    ],
    "team_composition": [
      {"role": "Engineering", "count": 4, "color": "#047857"},
      {"role": "Sales & Marketing", "count": 3, "color": "#059669"},
      {"role": "Operations", "count": 2, "color": "#10b981"},
      {"role": "Leadership", "count": 2, "color": "#34d399"}
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

IMPORTANT for chart_data - Generate ALL of these with realistic data:
- key_metrics: 4 highlight cards for executive summary. Icons must be one of: target, dollar, clock, trending, users, zap, trophy, rocket
- market_breakdown: TAM/SAM/SOM numbers (in billions). Keep the colors as provided.
- channels: 3-5 go-to-market channels with percentage allocation (must sum to 100)
- competitive_landscape: 4-6 dimensions comparing "us" vs "competitor_avg" (scores 0-100)
- milestones: 4-6 quarterly milestones for 12-month roadmap
- team_composition: 3-5 departments with headcount. Keep the colors as provided.
- revenue_projections: Year 1/2/3 revenue AND cost numbers (in millions)
- financial_table: 6-10 rows of key financial metrics with actual values

Each text section must be markdown-formatted with bullet points and bold numbers.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, canonicalDescription, pillars, gapAnalysis, improvedIdea, geography = 'Global' } = body;

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
TARGET GEOGRAPHY: ${geography}

CANONICAL DESCRIPTION: ${canonicalDescription || 'N/A'}

IMPROVED IDEA (7 PILLARS):
${Object.entries(improvedIdea).map(([key, value]) => `**${key.toUpperCase()}**: ${value}`).join('\n\n')}

VALIDATION SCORES:
${pillars?.map((p: any) => `- ${p.name}: ${p.score}/100`).join('\n') || 'N/A'}

${gapAnalysis && gapAnalysis.length > 0 ? `
GAP ANALYSIS:
${gapAnalysis.map((g: any) => `- ${g.pillarName} (${g.priority}): ${g.diagnosis}`).join('\n')}
` : ''}

Generate a comprehensive business plan with chart data based on this validated data FOR ${geography}. All market sizes, competitors, regulations, pricing, and financial projections should be specific to ${geography}. Use appropriate currency and market conditions for ${geography}.
`;

    const response = await callWithFallback(
      apiKey,
      [
        { role: 'system', content: BUSINESS_PLAN_PROMPT },
        { role: 'user', content: context }
      ],
      { maxTokens: 8192, temperature: 0.4, jsonMode: true }
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
      businessPlan.chart_data = {};
    }
    const cd = businessPlan.chart_data;
    if (!cd.key_metrics) {
      cd.key_metrics = [
        { label: 'TAM', value: '$100B', icon: 'target' },
        { label: 'Year 1 Revenue', value: '$5M', icon: 'dollar' },
        { label: 'Breakeven', value: '24 months', icon: 'clock' },
        { label: 'LTV/CAC Ratio', value: '30x', icon: 'trending' },
      ];
    }
    if (!cd.market_breakdown) {
      cd.market_breakdown = [
        { name: 'TAM', value: 100, color: '#047857' },
        { name: 'SAM', value: 30, color: '#059669' },
        { name: 'SOM', value: 5, color: '#10b981' },
        { name: 'Year 1 Target', value: 0.5, color: '#34d399' },
      ];
    }
    if (!cd.channels) {
      cd.channels = [
        { name: 'Direct Sales', percentage: 40 },
        { name: 'Partnerships', percentage: 30 },
        { name: 'Digital Marketing', percentage: 20 },
        { name: 'Referrals', percentage: 10 },
      ];
    }
    if (!cd.competitive_landscape) {
      cd.competitive_landscape = [
        { name: 'Innovation', us: 85, competitor_avg: 50 },
        { name: 'Market Reach', us: 40, competitor_avg: 70 },
        { name: 'Price Value', us: 80, competitor_avg: 55 },
        { name: 'Technology', us: 90, competitor_avg: 45 },
        { name: 'Support', us: 75, competitor_avg: 60 },
      ];
    }
    if (!cd.milestones) {
      cd.milestones = [
        { quarter: 'Q1', milestone: 'MVP launch and beta testing' },
        { quarter: 'Q2', milestone: 'First 100 paying customers' },
        { quarter: 'Q3', milestone: 'Series A fundraise' },
        { quarter: 'Q4', milestone: 'Scale to 1,000 users' },
      ];
    }
    if (!cd.team_composition) {
      cd.team_composition = [
        { role: 'Engineering', count: 4, color: '#047857' },
        { role: 'Sales & Marketing', count: 3, color: '#059669' },
        { role: 'Operations', count: 2, color: '#10b981' },
        { role: 'Leadership', count: 2, color: '#34d399' },
      ];
    }
    if (!cd.revenue_projections) {
      cd.revenue_projections = [
        { year: 'Year 1', revenue: 5, costs: 3 },
        { year: 'Year 2', revenue: 12, costs: 7 },
        { year: 'Year 3', revenue: 25, costs: 14 },
      ];
    }
    if (!cd.financial_table) {
      cd.financial_table = [
        { metric: 'Revenue Target (Y1)', value: '$5M' },
        { metric: 'Revenue Target (Y3)', value: '$25M' },
        { metric: 'CAC', value: '$500' },
        { metric: 'LTV', value: '$15,000' },
        { metric: 'Breakeven', value: '24 months' },
      ];
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
