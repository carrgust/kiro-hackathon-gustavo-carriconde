import { getProvider, Message } from '@/lib/api';
import { Hypothesis } from '@/types/project';
import { getTokenTracker } from './token-tracker';
import { calculateConfidence } from '../confidence';
import { getModelChain } from '@/lib/models/config';

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
      systemPrompt = `You are a market research expert. Generate specific problem hypotheses using the formula: [WHO] struggles with [WHAT], causing [NEGATIVE OUTCOME]. Examples: 'Pilots struggle with manual logs, causing compliance delays' or 'Developers struggle with API testing, causing deployment bugs'.`;
      userPrompt = `Generate ${count} problem hypotheses for the ${niche} market using format: [WHO] struggles with [WHAT], causing [NEGATIVE OUTCOME]. Format as JSON array with "text" field only. Keep under 50 characters.`;
    } else if (focus === 'solutions') {
      systemPrompt = `You are a solution architect. Generate specific solution hypotheses using the formula: [SOLUTION] that enables [WHO] to [BENEFIT]. Examples: 'Offline checklist app that enables pilots to complete preflight faster' or 'Auto-fill logger that enables pilots to submit reports instantly'.`;
      userPrompt = `Generate ${count} solution hypotheses for the ${niche} market using format: [SOLUTION] that enables [WHO] to [BENEFIT]. Format as JSON array with "text" field only. Keep under 80 characters each.`;
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

    // Use fallback system for hypothesis generation
    const modelChain = getModelChain('HYPOTHESIS')
    const { response } = await (provider as any).chatWithFallback(messages, modelChain)
    
    // Track token usage
    const tracker = getTokenTracker();
    tracker.log({
      promptTokens: response.tokens?.prompt || 0,
      completionTokens: response.tokens?.completion || 0,
      totalTokens: response.tokens?.total || 0,
      model: response.model || 'unknown',
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

  async generateSolutionForProblem(niche: string, problemText: string, problemId: string): Promise<Hypothesis[]> {
    const provider = getProvider('openrouter', this.apiKey);
    
    const systemPrompt = `You are a solution architect. Generate specific solution hypotheses using the formula: [SOLUTION] that enables [WHO] to [BENEFIT]. Examples: 'Offline checklist app that enables pilots to complete preflight faster' or 'Auto-fill logger that enables pilots to submit reports instantly'.`;
    const userPrompt = `Given this validated problem: "${problemText}" in the ${niche} market.

Generate 3 solution hypotheses using format: [SOLUTION] that enables [WHO] to [BENEFIT]. Format as JSON array with "text" field only. Keep under 80 characters each.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Use fallback system for hypothesis generation
    const modelChain = getModelChain('HYPOTHESIS')
    const { response } = await (provider as any).chatWithFallback(messages, modelChain)
    
    // Track token usage
    const tracker = getTokenTracker();
    tracker.log({
      promptTokens: response.tokens?.prompt || 0,
      completionTokens: response.tokens?.completion || 0,
      totalTokens: response.tokens?.total || 0,
      model: response.model || 'unknown',
      timestamp: new Date(),
      operation: 'solution-generation',
    });
    
    // Parse JSON response
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to generate solutions: Invalid response format from AI model');
    }

    const solutionsData = JSON.parse(jsonMatch[0]);
    
    return solutionsData.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      text: item.text || 'Solution hypothesis',
      type: 'solutions',
      state: 'hypothesis' as const,
      confidence: 0,
      parentProblemId: problemId,
      createdAt: new Date()
    }));
  }

  async generateRequirementForSolution(niche: string, solutionText: string, solutionId: string): Promise<Hypothesis[]> {
    const provider = getProvider('openrouter', this.apiKey);
    
    const systemPrompt = `You are a software requirements engineer. Generate specific, testable requirements for implementing the given solution. Use standard FR (Functional Requirement) and NFR (Non-Functional Requirement) format.`;
    const userPrompt = `Given this validated solution: "${solutionText}" for the ${niche} market.

Generate 3 requirements (mix of FR and NFR) needed to implement this solution. Format as JSON array with objects containing "text" field. Each requirement must start with "FR:" or "NFR:" followed by "The system shall [action]". Examples:
- "FR: The system shall allow users to export data"
- "NFR: The system shall respond within 200ms"
Keep under 60 characters.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Use fallback system for hypothesis generation
    const modelChain = getModelChain('HYPOTHESIS')
    const { response } = await (provider as any).chatWithFallback(messages, modelChain)
    
    // Track token usage
    const tracker = getTokenTracker();
    tracker.log({
      promptTokens: response.tokens?.prompt || 0,
      completionTokens: response.tokens?.completion || 0,
      totalTokens: response.tokens?.total || 0,
      model: response.model || 'unknown',
      timestamp: new Date(),
      operation: 'requirement-generation',
    });
    
    // Parse JSON response
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to generate requirements: Invalid response format from AI model');
    }

    const requirementsData = JSON.parse(jsonMatch[0]);
    
    return requirementsData.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      text: item.text || 'Requirement hypothesis',
      type: item.text?.startsWith('NFR:') ? 'non-functional' : 'functional',
      state: 'hypothesis' as const,
      confidence: 0,
      parentSolutionId: solutionId,
      createdAt: new Date()
    }));
  }

  async researchHypothesis(hypothesis: Hypothesis, niche: string, isProblemParam?: boolean): Promise<{ confidence: number; sources: string[] }> {
    let confidence = 50;
    let sources: string[] = [];
    
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
        confidence = data.confidence || 50;
        // Format sources with source type and confidence weight for better tracking
        sources = data.sources?.map((s: { 
          title: string; 
          snippet: string; 
          url: string; 
          domain: string; 
          source_type?: string; 
          confidence_weight?: number 
        }) => {
          const sourceTypeLabel = s.source_type ? `[${s.source_type.toUpperCase()}]` : '';
          const weightLabel = s.confidence_weight ? ` (${Math.round(s.confidence_weight * 100)}%)` : '';
          return `${sourceTypeLabel}[${s.domain || 'Web'}]${weightLabel} ${s.title} ||| ${s.snippet || ''} ||| ${s.url}`;
        }) || [];
      } else {
        console.error('[Research] Agent response not ok:', response.status);
      }
    } catch (error) {
      console.error('[HypothesisService] Research agent failed:', error);
    }
    
    // If agent failed, fallback to machine-gun
    if (sources.length === 0) {
      console.log('[Research] Falling back to machine-gun');
      const searchQuery = `${hypothesis.text} ${niche} market research`;
      
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
    }
    
    // PRODUCT HUNT INTEGRATION: Search for related products
    try {
      const phResponse = await fetch('/api/research/producthunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: `${hypothesis.text} ${niche}`,
        }),
      });
      
      if (phResponse.ok) {
        const phData = await phResponse.json();
        const products = phData.products || [];
        
        if (products.length > 0) {
          console.log('[Research] Product Hunt found:', products.length, 'products');
          
          // Add Product Hunt products as sources
          const phSources = products.map((p: any) => 
            `[Product Hunt] ${p.name} - ${p.tagline} (${p.votesCount} votes) ||| ${p.tagline} ||| ${p.url}`
          );
          sources = [...sources, ...phSources];
          
          // Boost confidence based on Product Hunt results
          if (products.length >= 5) {
            confidence = Math.min(98, confidence + 20);
            console.log('[Research] PH boost +20% (5+ products)');
          } else if (products.length >= 1) {
            confidence = Math.min(98, confidence + 10);
            console.log('[Research] PH boost +10% (1-4 products)');
          }
        }
      }
    } catch (error) {
      console.error('[HypothesisService] Product Hunt search failed:', error);
    }
    
    return { confidence, sources };
  }
}
