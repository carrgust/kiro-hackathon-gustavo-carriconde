import { AUTOCODER_FALLBACK_CHAIN } from '@/lib/config/models';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function callLLM(
  messages: { role: string; content: string }[],
  options?: { json?: boolean; maxTokens?: number }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  for (const model of AUTOCODER_FALLBACK_CHAIN) {
    try {
      console.log(`[AutoCoder] Trying model: ${model}`);
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://curatos.com',
        },
        body: JSON.stringify({
          model,
          messages,
          ...(options?.json ? { response_format: { type: 'json_object' } } : {}),
          temperature: 0.7,
          max_tokens: options?.maxTokens ?? 16384,
        }),
      });
      if (!res.ok) {
        console.log(`[AutoCoder] ${model} returned ${res.status}`);
        continue;
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        console.log(`[AutoCoder] ✓ ${model} returned ${content.length} chars`);
        return content;
      }
    } catch (e) {
      console.log(`[AutoCoder] ${model} error: ${e}`);
      continue;
    }
  }
  throw new Error('All models failed');
}
