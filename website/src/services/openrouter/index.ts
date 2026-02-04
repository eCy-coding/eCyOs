/**
 * OpenRouter Service
 * Export client and types, provide singleton instance
 */

export { OpenRouterClient } from './OpenRouterClient';
export type {
  Message,
  ChatOptions,
  ChatResponse,
  ChatChunk,
  Model,
  ModelsResponse,
  ErrorResponse
} from './types';

import { OpenRouterClient } from './OpenRouterClient';

/**
 * Singleton OpenRouter client instance
 * Initialized with API key from environment variables
 */
export const openRouter = new OpenRouterClient(
  import.meta.env.VITE_OPENROUTER_API_KEY || ''
);

// Also export as 'openrouter' for backward compatibility
export { openRouter as openrouter };

/**
 * Recommended models for different agent roles
 */
export const DEBATE_MODEL_CONFIG = {
  proposer: 'anthropic/claude-3.5-sonnet',
  critic: 'openai/gpt-4o',
  judge: 'google/gemini-2.0-flash-exp:free',
  synthesizer: 'meta-llama/llama-3.3-70b-instruct'
} as const;

/**
 * Fallback models (free tier)
 */
export const FREE_MODEL_CONFIG = {
  proposer: 'google/gemini-2.0-flash-exp:free',
  critic: 'google/gemini-2.0-flash-exp:free',
  judge: 'google/gemini-2.0-flash-exp:free',
  synthesizer: 'google/gemini-2.0-flash-exp:free'
} as const;
