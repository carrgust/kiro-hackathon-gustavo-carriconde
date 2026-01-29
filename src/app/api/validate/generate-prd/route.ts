import { NextRequest, NextResponse } from 'next/server';
import { callWithFallback } from '@/lib/validation/model-client';

const PRD_PROMPT = `You are a product requirements expert. Generate a comprehensive Product Requirements Document based on the validated business idea.

Input data:
- Business idea and description
- 7 validated pillars with scores
- Gap analysis with identified weaknesses
- Improved business idea addressing gaps

Generate a structured PRD with these sections:

1. EXECUTIVE SUMMARY (2-3 paragraphs)
2. PROBLEM STATEMENT (what problem we're solving)
3. TARGET MARKET & USERS (who we're building for)
4. PRODUCT OVERVIEW (high-level solution)
5. KEY FEATURES (3-5 core features based on validation)
6. SUCCESS METRICS / KPIs (measurable goals)
7. COMPETITIVE ADVANTAGE (what makes us unique)
8. GO-TO-MARKET STRATEGY (how we'll launch)
9. REVENUE MODEL (how we'll make money)
10. RISKS & MITIGATIONS (from gap analysis)
11. TIMELINE & MILESTONES (6-12 month roadmap)

Format as clean markdown with headers (##) and bullet points. Be specific and actionable.`;

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
      { maxTokens: 3000 }
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
