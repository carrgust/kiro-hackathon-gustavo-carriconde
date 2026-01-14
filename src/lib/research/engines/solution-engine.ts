import { getProvider, Message } from '@/lib/api';
import { getTokenTracker } from '@/lib/api/token-tracker';
import { EngineInput, EngineResult } from '../types';

export class SolutionEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async execute(input: EngineInput): Promise<EngineResult> {
    const provider = getProvider('openrouter', this.apiKey);

    const problems = input.previousResults[0]?.data?.problems || [];
    const problemsText = problems.length > 0 ? problems.join(', ') : 'various market problems';

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a solution architect analyzing solutions for the ${input.niche} niche.`,
      },
      {
        role: 'user',
        content: `Idea: "${input.idea}"
Problems identified: ${problemsText}

Generate 3-5 solution approaches for these problems in the ${input.niche} market.

Respond in JSON format:
{
  "solutions": ["solution 1", "solution 2", "solution 3"],
  "confidence": <0-100>,
  "findings": ["finding 1", "finding 2"]
}`,
      },
    ];

    const response = await provider.chat(messages, 'deepseek/deepseek-r1-0528:free');

    // Track tokens
    const tracker = getTokenTracker();
    tracker.log({
      promptTokens: response.tokens.prompt,
      completionTokens: response.tokens.completion,
      totalTokens: response.tokens.total,
      model: response.model,
      timestamp: new Date(),
      operation: 'solution-engine',
    });

    // Parse response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { solutions: [], confidence: 50, findings: [] };

    return {
      engineName: 'Solution Engine',
      confidence: data.confidence || 50,
      findings: data.findings || [],
      data: { solutions: data.solutions || [] },
      tokensUsed: response.tokens.total,
    };
  }
}
