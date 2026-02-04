// eCy OS v1005.0 - OpenRouter Client
// Unified API for 400+ AI models

import OpenAI from 'openai';

// Initialize OpenRouter client (OpenAI-compatible)
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  baseURL: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': import.meta.env.VITE_OPENROUTER_SITE_URL || 'http://localhost:5175',
    'X-Title': import.meta.env.VITE_OPENROUTER_SITE_NAME || 'eCy OS',
  },
  dangerouslyAllowBrowser: true, // For demo; use backend proxy in production
});

// Agent configuration types
export interface AgentConfig {
  role: 'proposer' | 'critic' | 'judge';
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

// Predefined agents for debate (optimized model selection)
export const DEBATE_AGENTS: Record<string, AgentConfig> = {
  proposer: {
    role: 'proposer',
    model: 'openai/gpt-4o-mini',
    systemPrompt: `You are the PROPOSER in a debate. Your role:
- Provide clear, well-reasoned solutions
- Use logical arguments and evidence
- Be concise but thorough (max 400 words)
- State your confidence level (0-1) at the end`,
    temperature: 0.7,
    maxTokens: 500,
  },
  critic: {
    role: 'critic',
    model: 'anthropic/claude-3.5-sonnet',
    systemPrompt: `You are the CRITIC in a debate. Your role:
- Analyze proposed solutions critically
- Find flaws, edge cases, and assumptions
- Suggest improvements
- Be constructive, not destructive
- State your agreement level (0-1) at the end`,
    temperature: 0.6,
    maxTokens: 500,
  },
  judge: {
    role: 'judge',
    model: 'google/gemini-2.0-flash-exp:free',
    systemPrompt: `You are the JUDGE in a debate. Your role:
- Evaluate all arguments objectively
- Synthesize the best solution from all inputs
- Decide if consensus is reached (confidence > 0.85)
- Format: "CONSENSUS: <yes/no> | ANSWER: <solution> | CONFIDENCE: <0-1>"`,
    temperature: 0.5,
    maxTokens: 400,
  },
};

// Message types
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Call a specific agent
export async function callAgent(
  agentConfig: AgentConfig,
  userMessage: string,
  context: Message[] = []
): Promise<string> {
  try {
    const messages: Message[] = [
      { role: 'system', content: agentConfig.systemPrompt },
      ...context,
      { role: 'user', content: userMessage },
    ];

    const response = await client.chat.completions.create({
      model: agentConfig.model,
      messages,
      temperature: agentConfig.temperature,
      max_tokens: agentConfig.maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error(`[OpenRouter] Error calling ${agentConfig.role}:`, error);
    throw new Error(`Agent ${agentConfig.role} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Stream agent response (for real-time UI updates)
export async function* streamAgent(
  agentConfig: AgentConfig,
  userMessage: string,
  context: Message[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    const messages: Message[] = [
      { role: 'system', content: agentConfig.systemPrompt },
      ...context,
      { role: 'user', content: userMessage },
    ];

    const stream = await client.chat.completions.create({
      model: agentConfig.model,
      messages,
      temperature: agentConfig.temperature,
      max_tokens: agentConfig.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error(`[OpenRouter] Stream error for ${agentConfig.role}:`, error);
    throw error;
  }
}

// List available models (for UI selection)
export async function listModels(): Promise<any[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      },
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[OpenRouter] Error listing models:', error);
    return [];
  }
}

// Legacy export for backward compatibility
export class OpenRouterClient {
  async chat(model: string, messages: Message[]): Promise<string> {
    const config: AgentConfig = {
      role: 'proposer',
      model,
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 500,
    };
    return callAgent(config, messages[messages.length - 1].content, messages.slice(0, -1));
  }
}

export const openRouter = new OpenRouterClient();

