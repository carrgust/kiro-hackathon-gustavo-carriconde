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

      const requestBody: Record<string, unknown> = {
        model,
        messages,
        temperature: options?.temperature || 0.3,
        max_tokens: options?.maxTokens || 2500
      };

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
        console.log(`[ModelClient] Success with ${model}, content length: ${content.length}`);
        return content;
      }

      const errorText = await response.text();
      console.error(`[ModelClient] ${model} error ${response.status}:`, errorText.substring(0, 200));
      errors.push(`${model}: ${response.status} - ${errorText.substring(0, 100)}`);

    } catch (error) {
      console.error(`[ModelClient] ${model} exception:`, error);
      errors.push(`${model}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.error('[ModelClient] All models failed. Errors:', errors);
  throw new Error(`All models failed: ${errors.join('; ')}`);
}
