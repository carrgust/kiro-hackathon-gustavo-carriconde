import { getProvider, Message } from '@/lib/api';
import { getTokenTracker } from '@/lib/api/token-tracker';
import { EngineInput, EngineResult } from '../types';

export class SynthesisEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async execute(input: EngineInput): Promise<EngineResult> {
    const provider = getProvider('openrouter', this.apiKey);

    const problems = input.previousResults[0]?.data?.problems || [];
    const solutions = input.previousResults[1]?.data?.solutions || [];

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a business analyst synthesizing research findings for the ${input.niche} niche.`,
      },
      {
        role: 'user',
        content: `Idea: "${input.idea}"
Niche: ${input.niche}

Problems: ${problems.join(', ')}
Solutions: ${solutions.join(', ')}

Synthesize the research and provide:
1. Overall viability score (0-100)
2. Key recommendation (pursue/pivot/abandon)
3. Top 3 insights
4. Next steps

Respond in JSON format:
{
  "viability": <0-100>,
  "recommendation": "pursue|pivot|abandon",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "nextSteps": ["step 1", "step 2"],
  "confidence": <0-100>
}`,
      },
    ];

    const response = await provider.chat(messages, 'google/gemini-2.0-flash-exp:free');

    // Track tokens
    const tracker = getTokenTracker();
    tracker.log({
      promptTokens: response.tokens.prompt,
      completionTokens: response.tokens.completion,
      totalTokens: response.tokens.total,
      model: response.model,
      timestamp: new Date(),
      operation: 'synthesis-engine',
    });

    // Parse response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    const data = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { viability: 50, recommendation: 'pivot', insights: [], nextSteps: [], confidence: 50 };

    return {
      engineName: 'Synthesis Engine',
      confidence: data.confidence || data.viability || 50,
      findings: data.insights || [],
      data: {
        viability: data.viability,
        recommendation: data.recommendation,
        nextSteps: data.nextSteps,
      },
      tokensUsed: response.tokens.total,
    };
  }
}
