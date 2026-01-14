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

    const response = await provider.chat(messages, 'deepseek/deepseek-r1-0528:free');
    
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
      state: 'hypothesis' as const,
      confidence: 0,
      createdAt: new Date()
    }));
  }

  async researchHypothesis(hypothesis: Hypothesis, niche: string): Promise<{ confidence: number; sources: string[] }> {
    const provider = getProvider('openrouter', this.apiKey);
    
    const systemPrompt = `You are a market research analyst. Research the given hypothesis using web search and provide a confidence score (0-100) based on real market evidence.`;
    
    const userPrompt = `Research this hypothesis in the ${niche} market: "${hypothesis.text}"
    
    Use web search to find real evidence. Provide response as JSON:
    {
      "confidence": <number 0-100>,
      "summary": "brief summary of findings"
    }
    
    Base confidence on actual market evidence, competition analysis, and feasibility from web sources.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Use :online suffix to enable web search via Exa.ai
    // For free models, use :free:online format
    const response = await provider.chat(messages, 'google/gemini-2.0-flash-exp:free:online');
    
    // Track token usage
    const tracker = getTokenTracker();
    tracker.log({
      promptTokens: response.tokens.prompt,
      completionTokens: response.tokens.completion,
      totalTokens: response.tokens.total,
      model: response.model,
      timestamp: new Date(),
      operation: 'research-validation',
    });
    
    // Extract real URLs from annotations
    const sources: string[] = [];
    if (response.annotations && Array.isArray(response.annotations)) {
      for (const annotation of response.annotations) {
        if (annotation.url_citation?.url) {
          const title = annotation.url_citation.title || 'Source';
          const url = annotation.url_citation.url;
          sources.push(`${title}: ${url}`);
        }
      }
    }
    
    if (sources.length === 0) {
      throw new Error('Web search failed: No sources found. Please try again or check your API key.');
    }
    
    // Parse confidence from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse research results: Invalid response format from AI model');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    return {
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      sources
    };
  }
}
