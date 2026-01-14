import { AIProvider, Message, ChatResponse, RateLimitInfo, HealthStatus } from './types';
import { withRetry, DEFAULT_RETRY_CONFIG } from './retry';

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'deepseek/deepseek-r1-0528:free';
  private rateLimitInfo: RateLimitInfo | null = null;
  private lastSuccessfulRequest: Date | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private parseRateLimitHeaders(headers: Headers): RateLimitInfo | null {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');

    if (!limit || !remaining || !reset) return null;

    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: new Date(parseInt(reset, 10) * 1000),
    };
  }

  async chat(messages: Message[], model?: string): Promise<ChatResponse> {
    return withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://curatos.app',
          'X-Title': 'Curatos DNA'
        },
        body: JSON.stringify({
          model: model || this.defaultModel,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      // Parse rate limit headers
      this.rateLimitInfo = this.parseRateLimitHeaders(response.headers);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      this.lastSuccessfulRequest = new Date();
      
      return {
        content: data.choices[0]?.message?.content || '',
        model: data.model || model || this.defaultModel,
        tokens: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0
        },
        annotations: data.choices[0]?.message?.annotations || undefined
      };
    }, DEFAULT_RETRY_CONFIG);
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  getHealthStatus(): HealthStatus {
    return {
      connected: this.lastSuccessfulRequest !== null,
      lastSuccessfulRequest: this.lastSuccessfulRequest,
      rateLimitInfo: this.rateLimitInfo,
    };
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [
        'deepseek/deepseek-r1-0528:free',
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free'
      ];
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
