import { NextRequest, NextResponse } from 'next/server';
import { callWithFallback } from '@/lib/validation/model-client';

const PRD_PROMPT = `You are a product requirements expert. Generate a concise PRD from validated business data.

STRICT RULES:
- Each section: MAX 3-4 bullet points, 1-2 sentences each
- Total output: under 1500 words
- Be specific and actionable, not verbose
- Use markdown ## headers and bullet points

SECTIONS:
1. EXECUTIVE SUMMARY (1 short paragraph, max 60 words)
2. PROBLEM STATEMENT (3 bullets)
3. TARGET MARKET (3 bullets with segments)
4. PRODUCT OVERVIEW (1 paragraph, max 50 words)
5. KEY FEATURES (3-5 features, name + one-line description each)
6. SUCCESS METRICS (4 KPIs with target numbers)
7. COMPETITIVE ADVANTAGE (3 bullets)
8. GO-TO-MARKET (3 channel bullets)
9. REVENUE MODEL (pricing tiers, max 3)
10. RISKS & MITIGATIONS (3 rows: risk | mitigation)
11. ROADMAP (3 milestones: Month X - deliverable)

Keep it tight. Investors read PRDs in 2 minutes.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, canonicalDescription, pillars, gapAnalysis, improvedIdea } = body;

    if (!idea || !pillars) {
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

    console.log('[GeneratePRD] Starting PRD generation...');

    // Build context from all data
    const context = `
BUSINESS IDEA: ${idea}

CANONICAL DESCRIPTION: ${canonicalDescription || 'N/A'}

VALIDATION SCORES:
${pillars.map((p: any) => `- ${p.name}: ${p.score}/100`).join('\n')}

${gapAnalysis && gapAnalysis.length > 0 ? `
GAP ANALYSIS:
${gapAnalysis.map((g: any) => `
- ${g.pillarName} (${g.priority} priority)
  Diagnosis: ${g.diagnosis}
  Actions: ${g.actions.join('; ')}
`).join('\n')}
` : ''}

${improvedIdea ? `
IMPROVED IDEA:
${Object.entries(improvedIdea).map(([key, value]) => `${key.toUpperCase()}: ${value}`).join('\n\n')}
` : ''}
`;

    const prd = await callWithFallback(
      apiKey,
      [
        { role: 'system', content: PRD_PROMPT },
        { role: 'user', content: context }
      ],
      { maxTokens: 4096 }
    );

    console.log('[GeneratePRD] PRD generated successfully');

    return NextResponse.json({ prd });

  } catch (error: any) {
    console.error('[GeneratePRD] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PRD' },
      { status: 500 }
    );
  }
}
