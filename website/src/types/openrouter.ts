/**
 * OpenRouter API Type Definitions
 * eCy OS v1005.0 - Intelligence Layer
 */

export type DebateRole = 'proposer' | 'critic' | 'judge';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  created: number;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface DebatePromptConfig {
  role: DebateRole;
  topic: string;
  context: string[];
  agentName: string;
  agentPersonality: string;
}

export interface DebateResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
  };
  model: string;
  latency: number;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 8000,
  backoffMultiplier: 2,
};
