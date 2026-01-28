/**
 * SINGLE SOURCE OF TRUTH - All model configurations.
 * DO NOT hardcode model strings elsewhere.
 * 
 * All model identifiers, chains, and defaults are defined here.
 * Import from this file to ensure consistency across the codebase.
 */

// Model Identifiers
export const MODELS = {
  GLM: 'z-ai/glm-4.7-flash',
  GEMINI_LITE: 'google/gemini-2.5-flash-lite',
  DEEPSEEK: 'deepseek/deepseek-v3.2-speciale',
} as const;

// Single Universal Fallback Chain
export const FALLBACK_CHAIN = [
  MODELS.GEMINI_LITE,       // Primary - fast
  MODELS.GLM,               // Fallback 1
  MODELS.DEEPSEEK,          // Fallback 2
] as const;

// Primary Model (first in chain)
export const PRIMARY_MODEL = FALLBACK_CHAIN[0];

// Default model for all use cases
export const DEFAULT_MODEL = PRIMARY_MODEL;
