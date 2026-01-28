import { getProvider, Message } from '@/lib/api';
import { getTokenTracker } from '@/lib/api/token-tracker';
import { EngineInput, EngineResult } from '../types';
import { PRIMARY_MODEL } from '@/lib/config/models';

export class ProblemEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async execute(input: EngineInput): Promise<EngineResult> {
    const provider = getProvider('openrouter', this.apiKey);

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a market research expert analyzing problems in the ${input.niche} niche.`,
      },
      {
        role: 'user',
        content: `Analyze this idea: "${input.idea}"

Generate 3-5 key problems this idea solves in the ${input.niche} market.

Respond in JSON format:
{
  "problems": ["problem 1", "problem 2", "problem 3"],
  "confidence": <0-100>,
  "findings": ["finding 1", "finding 2"]
}`,
      },
    ];

    const response = await provider.chat(messages, PRIMARY_MODEL);

    // Track tokens
    const tracker = getTokenTracker();
    tracker.log({
      promptTokens: response.tokens.prompt,
      completionTokens: response.tokens.completion,
      totalTokens: response.tokens.total,
      model: response.model,
      timestamp: new Date(),
      operation: 'problem-engine',
    });

    // Parse response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { problems: [], confidence: 50, findings: [] };

    return {
      engineName: 'Problem Engine',
      confidence: data.confidence || 50,
      findings: data.findings || [],
      data: { problems: data.problems || [] },
      tokensUsed: response.tokens.total,
    };
  }
}
