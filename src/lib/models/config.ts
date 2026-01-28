// Resilient Model Configuration System
import { FALLBACK_CHAIN } from '@/lib/config/models';

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
  apiKeys: string[]
): Promise<FallbackResult> {
  const errors: string[] = [];
  
  for (const apiKey of apiKeys) {
    for (const model of FALLBACK_CHAIN) {
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
