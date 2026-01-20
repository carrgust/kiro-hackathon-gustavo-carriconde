// Resilient Model Configuration System

export type UseCase = 'ORCHESTRATOR' | 'HYPOTHESIS' | 'RESEARCH' | 'STREAMING';

export const MODEL_CHAINS: Record<UseCase, string[]> = {
  ORCHESTRATOR: [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free', 
    'deepseek/deepseek-r1-0528:free',
    'deepseek/deepseek-chat'
  ],
  HYPOTHESIS: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-coder:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-chat'
  ],
  RESEARCH: [
    'qwen/qwen3-coder:free',
    'mistralai/devstral-2512:free',
    'deepseek/deepseek-r1-0528:free',
    'deepseek/deepseek-chat'
  ],
  STREAMING: [
    'deepseek/deepseek-r1-0528:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-3-27b-it:free',
    'deepseek/deepseek-chat'
  ]
};

interface FallbackResult {
  response: any;
  modelUsed: string;
  apiKeyUsed: string;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Provider {
  chat(messages: Message[], model?: string): Promise<any>;
}

export async function callWithFallback(
  provider: Provider,
  messages: Message[],
  modelChain: string[],
  apiKeys: string[]
): Promise<FallbackResult> {
  const errors: string[] = [];
  
  for (const apiKey of apiKeys) {
    for (const model of modelChain) {
      try {
        console.log(`[MODEL_FALLBACK] Trying ${model} with API key ${apiKey.substring(0, 10)}...`);
        
        const response = await provider.chat(messages, model);
        
        console.log(`[MODEL_FALLBACK] ✓ Success with ${model}`);
        return {
          response,
          modelUsed: model,
          apiKeyUsed: apiKey
        };
        
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        errors.push(`${model}: ${errorMsg}`);
        
        // Check for rate limit errors
        if (error?.status === 429 || errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
          console.log(`[MODEL_FALLBACK] ⚠ Rate limited on ${model}, trying next model...`);
          continue; // Try next model with same API key
        }
        
        // For other errors, also try next model
        console.log(`[MODEL_FALLBACK] ✗ Failed ${model}: ${errorMsg}`);
        continue;
      }
    }
    
    // If all models failed with this API key, try next API key
    console.log(`[MODEL_FALLBACK] All models failed with API key ${apiKey.substring(0, 10)}, trying next key...`);
  }
  
  // All models and API keys failed
  throw new Error(`All models failed. Errors: ${errors.join('; ')}`);
}

export function getModelChain(useCase: UseCase): string[] {
  return MODEL_CHAINS[useCase] || MODEL_CHAINS.ORCHESTRATOR;
}
