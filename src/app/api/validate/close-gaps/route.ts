import { NextRequest, NextResponse } from 'next/server';
import { callWithFallback } from '@/lib/validation/model-client';

interface Subcategory {
  name: string;
  score: number | null;
}

interface Pillar {
  name: string;
  score: number | null;
  subcategories: Subcategory[];
}

interface GapAnalysisRequest {
  idea: string;
  canonicalDescription: string;
  pillars: Pillar[];
  geography?: string;
}

interface GapResult {
  pillarName: string;
  score: number;
  diagnosis: string;
  actions: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export async function POST(request: NextRequest) {
  try {
    const body: GapAnalysisRequest = await request.json();
    const { canonicalDescription, pillars, geography = 'Global' } = body;

    // Get API key from environment (server-side)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[CloseGaps] No OPENROUTER_API_KEY in environment');
      return NextResponse.json({ error: 'Server not configured - no API key' }, { status: 500 });
    }

    console.log('[CloseGaps] Starting analysis, pillars count:', pillars.length);

    // Filter to only gap pillars (score < 70)
    const gapPillars = pillars.filter(p => (p.score ?? 0) < 70);
    console.log('[CloseGaps] Gap pillars found:', gapPillars.length, gapPillars.map(p => `${p.name}:${p.score}`));

    if (gapPillars.length === 0) {
      return NextResponse.json({ gaps: [], improvedIdea: null });
    }

    // Analyze each gap pillar
    const gaps: GapResult[] = [];

    for (const pillar of gapPillars) {
      const subcategoryList = pillar.subcategories
        .map(sub => `- ${sub.name}: ${sub.score ?? 0}/100`)
        .join('\n');

      const prompt = `You are a business strategy advisor. A business idea was validated and the pillar "${pillar.name}" scored ${pillar.score}/100 (weak).

Business idea: ${canonicalDescription}
Target geography: ${geography}

Subcategory scores:
${subcategoryList}

Analyze WHY this pillar scored low IN THE CONTEXT OF ${geography} and provide:
1. GAP DIAGNOSIS: One sentence explaining the core weakness considering ${geography} market conditions (max 30 words)
2. ACTION ITEMS: Exactly 3 specific, actionable steps to improve this pillar for ${geography} (each max 20 words)
3. PRIORITY: Rate urgency as HIGH, MEDIUM, or LOW

Return JSON only: { "diagnosis": "...", "actions": ["...", "...", "..."], "priority": "HIGH|MEDIUM|LOW" }`;

      try {
        console.log(`[CloseGaps] Analyzing pillar: ${pillar.name} (score: ${pillar.score})`);
        
        const response = await callWithFallback(
          apiKey,
          [{ role: 'user', content: prompt }],
          { temperature: 0.3, maxTokens: 800, jsonMode: true }
        );

        console.log(`[CloseGaps] LLM response for ${pillar.name}:`, response.substring(0, 100));

        // Parse JSON response
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }

        const analysis = JSON.parse(cleanResponse);

        gaps.push({
          pillarName: pillar.name,
          score: pillar.score ?? 0,
          diagnosis: analysis.diagnosis,
          actions: analysis.actions,
          priority: analysis.priority
        });
        
        console.log(`[CloseGaps] Successfully analyzed ${pillar.name}`);
      } catch (error) {
        console.error(`[CloseGaps] Failed to analyze ${pillar.name}:`, error);
        console.error(`[CloseGaps] Error details:`, error instanceof Error ? error.message : String(error));
        // Continue with other pillars
      }
    }

    // Generate improved business idea
    let improvedIdea = null;
    if (gaps.length > 0) {
      const gapsSummary = gaps
        .map(g => `${g.pillarName} (${g.score}): ${g.diagnosis}`)
        .join('\n');

      const improvePrompt = `You are a business strategist. Based on the gap analysis below, rewrite and improve this business idea to address all weaknesses.

ORIGINAL IDEA: ${canonicalDescription}
TARGET GEOGRAPHY: ${geography}

GAPS FOUND:
${gapsSummary}

Rewrite the business idea in 7 short sentences, one for each pillar (problem, market, competition, solution, monetization, gtm, timing). Each sentence must directly address any weakness found FOR ${geography}. If a pillar was strong (no gap), keep the original strength. If weak, rewrite to close the gap considering ${geography} market conditions.

Return JSON: { "problem": "...", "market": "...", "competition": "...", "solution": "...", "monetization": "...", "gtm": "...", "timing": "..." }`;

      try {
        console.log('[CloseGaps] Generating improved idea...');
        
        const response = await callWithFallback(
          apiKey,
          [{ role: 'user', content: improvePrompt }],
          { temperature: 0.3, maxTokens: 1500, jsonMode: true }
        );

        console.log('[CloseGaps] Improved idea response length:', response.length);

        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }

        improvedIdea = JSON.parse(cleanResponse);
        console.log('[CloseGaps] Successfully generated improved idea');
      } catch (error) {
        console.error('[CloseGaps] Failed to generate improved idea:', error);
        console.error('[CloseGaps] Error details:', error instanceof Error ? error.message : String(error));
      }
    }

    return NextResponse.json({ gaps, improvedIdea });
  } catch (error) {
    console.error('Close gaps error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze gaps' },
      { status: 500 }
    );
  }
}
