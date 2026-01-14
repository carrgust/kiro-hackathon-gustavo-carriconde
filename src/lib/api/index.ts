import { AIProvider } from './types';
import { OpenRouterProvider } from './openrouter';

export type ProviderType = 'openrouter' | 'anthropic' | 'openai';

export function getProvider(type: ProviderType, apiKey: string): AIProvider {
  switch (type) {
    case 'openrouter':
      return new OpenRouterProvider(apiKey);
    case 'anthropic':
      throw new Error('Anthropic provider not implemented yet');
    case 'openai':
      throw new Error('OpenAI provider not implemented yet');
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('curatos_api_key');
}

export function storeApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('curatos_api_key', apiKey);
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('curatos_api_key');
}

export * from './types';
export * from './openrouter';
