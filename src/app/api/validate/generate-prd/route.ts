import { NextRequest, NextResponse } from 'next/server';
import { callWithFallback } from '@/lib/validation/model-client';

const PRD_SYSTEM_PROMPT = `You are an MVP product requirements expert. Generate a concise MVP PRD as structured JSON.

STRICT RULES:
- MVP scope only — minimal viable product, nothing more
- Functional Requirements + Non-Functional Requirements COMBINED: MAX 10 items total
- User Stories: 5-8 stories max
- Target Users: 2-3 personas max
- Executive Summary: 1 paragraph, max 60 words
- All items must be numbered with their prefix (U-001, US-001, FR-001, NFR-001)
- User stories must reference a persona_id from target_users
- Functional requirements must include story_ids (which user stories they serve) and priority (build order)
- Non-functional requirements must include applies_to (which FRs they constrain, or ["global"])
- Be specific and actionable, not verbose

Return ONLY valid JSON with this exact structure:
{
  "executive_summary": "string",
  "target_users": [
    {
      "id": "U-001",
      "persona": "string",
      "age_range": "string",
      "description": "string",
      "pain_points": ["string"],
      "primary_need": "string"
    }
  ],
  "user_stories": [
    {
      "id": "US-001",
      "persona_id": "U-001",
      "story": "As a [persona], I want [X], so that [Y]",
      "acceptance_criteria": ["string"]
    }
  ],
  "functional_requirements": [
    {
      "id": "FR-001",
      "name": "string",
      "description": "string",
      "story_ids": ["US-001"],
      "priority": 1
    }
  ],
  "non_functional_requirements": [
    {
      "id": "NFR-001",
      "name": "string",
      "category": "Performance|Security|Accessibility|Scalability",
      "description": "string",
      "target": "string",
      "applies_to": ["FR-001"]
    }
  ]
}

Return ONLY the JSON object. No markdown fences, no explanation.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, canonicalDescription, pillars, gapAnalysis, improvedIdea } = body;

    if (!idea || !pillars) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('[GeneratePRD] Starting PRD generation...');

    const context = `BUSINESS IDEA: ${idea}
CANONICAL DESCRIPTION: ${canonicalDescription || 'N/A'}
VALIDATION SCORES:
${pillars.map((p: any) => `- ${p.name}: ${p.score}/100`).join('\n')}
${gapAnalysis && gapAnalysis.length > 0 ? `GAP ANALYSIS:
${gapAnalysis.map((g: any) => `- ${g.pillarName}: ${g.diagnosis} Actions: ${g.actions.join('; ')}`).join('\n')}` : ''}
${improvedIdea ? `IMPROVED IDEA:
${Object.entries(improvedIdea).map(([key, value]) => `${key.toUpperCase()}: ${value}`).join('\n')}` : ''}`;

    const result = await callWithFallback(
      apiKey,
      [
        { role: 'system', content: PRD_SYSTEM_PROMPT },
        { role: 'user', content: context }
      ],
      { maxTokens: 4096 }
    );

    console.log('[GeneratePRD] Raw response received, parsing JSON...');

    let prdData;
    try {
      const cleaned = result.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      prdData = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('[GeneratePRD] JSON parse failed:', parseError);
      return NextResponse.json({ error: 'Failed to parse PRD response' }, { status: 500 });
    }

    console.log('[GeneratePRD] PRD generated successfully');
    return NextResponse.json({ prd: prdData });

  } catch (error: any) {
    console.error('[GeneratePRD] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PRD' }, { status: 500 });
  }
}
