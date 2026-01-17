import { getProvider, Message } from '@/lib/api';
import { Hypothesis } from '@/types/project';
import { getTokenTracker } from './token-tracker';
import { calculateConfidence } from '../confidence';

export class HypothesisService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateHypotheses(niche: string, focus: 'problems' | 'solutions' | 'requirements', count: number = 3): Promise<Hypothesis[]> {
    const provider = getProvider('openrouter', this.apiKey);
    
    let systemPrompt: string;
    let userPrompt: string;
    
    if (focus === 'problems') {
      systemPrompt = `You are a market research expert. Generate specific, actionable problem hypotheses for the ${niche} niche. Each hypothesis should be a clear problem statement that could be validated through research.`;
      userPrompt = `Generate ${count} problem hypotheses for the ${niche} market. Format as a JSON array with objects containing "text" field only. Keep each hypothesis under 50 characters. Be specific and actionable.`;
    } else if (focus === 'solutions') {
      systemPrompt = `You are a solution architect. Generate specific, buildable solution hypotheses for the ${niche} niche. Each solution should be technically feasible and address real market needs.`;
      userPrompt = `Generate ${count} solution hypotheses for the ${niche} market. Format as a JSON array with objects containing "text" field only. Keep each hypothesis under 50 characters. Be specific and actionable.`;
    } else {
      // requirements
      systemPrompt = `You are a software requirements engineer. Generate specific, testable requirements for a ${niche} application. Use standard FR (Functional Requirement) and NFR (Non-Functional Requirement) format.`;
      userPrompt = `Generate ${count} requirements for a ${niche} app. Mix of FR and NFR. Format as JSON array with objects containing "text" field. Each requirement must start with "FR:" or "NFR:" followed by "The system shall [action]". Examples:
- "FR: The system shall allow users to export data"
- "NFR: The system shall respond within 200ms"
Keep under 60 characters.`;
    }

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
    // Use intelligent research agent
    try {
      const response = await fetch('/api/research/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hypothesis: `${hypothesis.text} in ${niche}`,
          apiKey: this.apiKey
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Research] Agent returned:', data.confidence, 'confidence');
        // Format sources as "[Domain] Title ||| Snippet ||| URL" for consistency
        const formattedSources = data.sources?.map((s: { title: string; snippet: string; url: string; domain: string }) => 
          `[${s.domain || 'Web'}] ${s.title} ||| ${s.snippet || ''} ||| ${s.url}`
        ) || [];
        return { 
          confidence: data.confidence || 50, 
          sources: formattedSources
        };
      } else {
        console.error('[Research] Agent response not ok:', response.status);
      }
    } catch (error) {
      console.error('[HypothesisService] Research agent failed:', error);
    }
    
    // Fallback to machine-gun if agent fails
    console.log('[Research] Falling back to machine-gun');
    const searchQuery = `${hypothesis.text} ${niche} market research`;
    let sources: string[] = [];
    
    try {
      const response = await fetch('/api/research/machine-gun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (response.ok) {
        const data = await response.json();
        sources = data.sources || [];
      }
    } catch (error) {
      console.error('[HypothesisService] Machine gun fallback failed:', error);
    }
    
    const confidence = calculateConfidence(sources, hypothesis.text);
    
    return { confidence, sources };
  }
}
