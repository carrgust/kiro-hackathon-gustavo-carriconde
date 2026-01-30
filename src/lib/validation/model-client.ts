import { FALLBACK_CHAIN } from '@/lib/config/models';

export async function callWithFallback(
  apiKey: string,
  messages: { role: string; content: string }[],
  options?: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const errors: string[] = [];
  
  for (const model of FALLBACK_CHAIN) {
    try {
      console.log(`[ModelClient] Trying model: ${model}`);
      
      const requestBody: any = {
        model,
        messages,
        temperature: options?.temperature || 0.3,
        max_tokens: options?.maxTokens || 2500
      };
      
      // Only add response_format for models that support it
      if (options?.jsonMode && (model.includes('gemini') || model.includes('deepseek'))) {
        requestBody.response_format = { type: 'json_object' };
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://curatos.app',
          'X-Title': 'Curatos DNA Validator'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log(`[ModelClient] ${model} response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        console.log(`[ModelClient] ✓ Success with ${model}, content length: ${content.length}`);
        return content;
      }
      
      // Log error response
      const errorText = await response.text();
      console.error(`[ModelClient] ${model} error ${response.status}:`, errorText.substring(0, 200));
      errors.push(`${model}: ${response.status} - ${errorText.substring(0, 100)}`);
      
      // If 429 or 5xx, try next model
      if (response.status === 429 || response.status >= 500) {
        console.log(`[ModelClient] ${model} failed with ${response.status}, trying next...`);
        continue;
      }
      
      // For other errors, also try next model
      console.log(`[ModelClient] ${model} failed, trying next model...`);
      continue;
      
    } catch (error) {
      console.error(`[ModelClient] ${model} exception:`, error);
      errors.push(`${model}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
  }
  
  console.error('[ModelClient] All models failed. Errors:', errors);
  throw new Error(`All models failed: ${errors.join('; ')}`);
}
