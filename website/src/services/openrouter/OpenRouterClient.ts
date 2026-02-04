/**
 * OpenRouter API Client
 * Provides access to 400+ AI models with streaming support
 */

import type {
  Message,
  ChatOptions,
  ChatResponse,
  ChatChunk,
  Model,
  ModelsResponse,
  ErrorResponse
} from './types';

export class OpenRouterClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly appName = 'eCy OS v1005';
  private readonly appUrl = 'https://ecy-os.vercel.app';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Chat completion with optional streaming
   * @param model - Model ID (e.g., 'anthropic/claude-3.5-sonnet')
   * @param messages - Array of conversation messages
   * @param options - Configuration options
   * @returns ChatResponse or AsyncIterable for streaming
   */
  async chat(
    model: string,
    messages: Message[],
    options: ChatOptions = {}
  ): Promise<ChatResponse | AsyncIterable<ChatChunk>> {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = this.getHeaders();

    const body = {
      model,
      messages,
      stream: options.stream ?? false,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048
    };

    if (options.stream) {
      return this.streamChat(url, headers, body);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return await response.json() as ChatResponse;
  }

  /**
   * Stream chat responses chunk by chunk
   * @private
   */
  private async *streamChat(
    url: string,
    headers: Record<string, string>,
    body: unknown
  ): AsyncIterable<ChatChunk> {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') return;

          try {
            const chunk = JSON.parse(data) as ChatChunk;
            yield chunk;
          } catch (parseError) {
            console.warn('Failed to parse SSE chunk:', parseError);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Fetch all available models from OpenRouter
   * @returns Array of available models with metadata
   */
  async getModels(): Promise<Model[]> {
    const url = `${this.baseUrl}/models`;
    const headers = this.getHeaders();

    const response = await fetch(url, { headers });

    if (!response.ok) {
      await this.handleError(response);
    }

    const data = await response.json() as ModelsResponse;
    return data.data;
  }

  /**
   * Get models filtered by criteria
   * @param filter - Filter function
   * @returns Filtered array of models
   */
  async getFilteredModels(
    filter: (model: Model) => boolean
  ): Promise<Model[]> {
    const models = await this.getModels();
    return models.filter(filter);
  }

  /**
   * Get common request headers
   * @private
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.appUrl,
      'X-Title': this.appName
    };
  }

  /**
   * Handle API errors
   * @private
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = `OpenRouter API error: ${response.status}`;

    try {
      const errorData = await response.json() as ErrorResponse;
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = `${errorMessage} - ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  /**
   * Test API connection
   * @returns true if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}
