import { getProvider, Message } from '@/lib/api';
import { Hypothesis } from '@/types/project';
import { getTokenTracker } from './token-tracker';

export class HypothesisService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateHypotheses(niche: string, focus: 'problems' | 'solutions', count: number = 3): Promise<Hypothesis[]> {
    const provider = getProvider('openrouter', this.apiKey);
    
    const systemPrompt = focus === 'problems' 
      ? `You are a market research expert. Generate specific, actionable problem hypotheses for the ${niche} niche. Each hypothesis should be a clear problem statement that could be validated through research.`
      : `You are a solution architect. Generate specific, buildable solution hypotheses for the ${niche} niche. Each solution should be technically feasible and address real market needs.`;

    const userPrompt = `Generate ${count} ${focus} hypotheses for the ${niche} market. Format as a JSON array with objects containing "text" field only. Keep each hypothesis under 50 characters. Be specific and actionable.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await provider.chat(messages, {
      models: ['deepseek/deepseek-chat'],
      route: 'fallback'
    });
    
    // Track token usage
    const tracker = getTokenTracker();
    tracker.log({
      promptTokens: response.tokens.prompt,
      completionTokens: response.tokens.completion,
      totalTokens: response.tokens.total,
      model: response.model,
      timestamp: new Date(),
      operation: 'hypothesis-generation',
    });
    
    // Parse JSON response
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to generate hypotheses: Invalid response format from AI model');
    }

    const hypothesesData = JSON.parse(jsonMatch[0]);
    
    return hypothesesData.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      text: item.text || `${focus} hypothesis`,
      type: focus,  // ADD THIS LINE - 'problems' or 'solutions'
      state: 'hypothesis' as const,
      confidence: 0,
      createdAt: new Date()
    }));
  }

  async researchHypothesis(hypothesis: Hypothesis, niche: string, isProblemParam?: boolean): Promise<{ confidence: number; sources: string[] }> {
    // Use the new ScoringEngine for structured validation
    const { ScoringEngine } = await import('../research/engines/scoring-engine');
    const scoringEngine = new ScoringEngine(this.apiKey);
    
    // Use explicit parameter if provided, otherwise infer from type
    const isProblemType = isProblemParam !== undefined 
      ? isProblemParam 
      : (hypothesis.type === 'functional' || hypothesis.type === undefined);
    
    // Score using structured criteria
    const result = isProblemType
      ? await scoringEngine.scoreProblem(hypothesis.text, niche)
      : await scoringEngine.scoreSolution(hypothesis.text, niche);
    
    return {
      confidence: result.confidence,
      sources: result.sources,
    };
  }
}
