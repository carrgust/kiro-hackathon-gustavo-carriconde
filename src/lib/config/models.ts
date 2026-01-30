/**
 * SINGLE SOURCE OF TRUTH - All model configurations.
 * DO NOT hardcode model strings elsewhere.
 *
 * Position = priority. Swap any model ID at any position.
 * Import from this file to ensure consistency across the codebase.
 */

// App-wide fallback chain (validation, gaps, business plan, PRD, research)
export const FALLBACK_CHAIN = [
  'google/gemini-2.5-flash-lite',     // Primary - fast
  'z-ai/glm-4.7-flash',              // Fallback 1
  'deepseek/deepseek-v3.2-speciale', // Fallback 2
] as const;

// AutoCoder-specific fallback chain (designer, decomposer, implementer)
export const AUTOCODER_FALLBACK_CHAIN = [
  'deepseek/deepseek-v3.2-speciale',  // Fallback 2
  'google/gemini-2.5-flash-lite',     // Fallback 1
  'meta-llama/llama-4-scout',          
  'qwen/qwen-2.5-7b-instruct',       // Primary - optimized for code
  'google/gemini-2.5-flash-lite',     // Fallback 1

] as const;

// Convenience exports (derived from position)
export const PRIMARY_MODEL = FALLBACK_CHAIN[0];
export const DEFAULT_MODEL = PRIMARY_MODEL;
