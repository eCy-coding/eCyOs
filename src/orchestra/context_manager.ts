
/**
 * Context Manager (The Cortex Memory)
 * -----------------------------------
 * Manages the "Short Term Memory" of the AI.
 * Implements a Sliding Window algorithm to ensure the conversation stays within token limits
 * without losing the most critical context (System Instructions + Recent History).
 */

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ActionContext {
    role: string;
    content: string;
}

export class ContextManager {

    // Standard Llama 2 / Mistral limit is usually 4096 or 8192. 
    // We set a conservative default for "Zero Error" margin.
    private static readonly DEFAULT_TOKEN_LIMIT = 4000;
    
    // Crude estimation: 1 token ~= 4 chars (English).
    private static readonly CHARS_PER_TOKEN = 4;

    private messages: Message[];
    private systemMessage: Message;
    private readonly maxTokens: number;

    constructor(systemInstruction: string = "You are a helpful assistant.", maxTokens: number = ContextManager.DEFAULT_TOKEN_LIMIT) {
        this.systemMessage = { role: 'system', content: systemInstruction };
        this.messages = [];
        this.maxTokens = maxTokens;
    }

    /**
     * Adds a message to the context buffer.
     * Automatically prunes old history if limit is exceeded.
     */
    public add(message: Message) {
        this.messages.push(message);
        this.prune();
    }

    public getContext(): Message[] {
        return [this.systemMessage, ...this.messages];
    }

    public updateSystemInstruction(newInstruction: string) {
        this.systemMessage.content = newInstruction;
        this.prune();
    }

    /**
     * Sliding Window Algorithm
     * ------------------------
     * Removes the oldest messages (after System Prompt) until the context fits in the window.
     * Time Complexity: O(n) where n is number of messages (worst case all pruned).
     */
    private prune() {
        let currentSize = this.estimateTokens(this.systemMessage) + this.getTotalTokens();
        
        // While we exceed the limit and have history to prune...
        // We keep pruning from the start (index 0) of the history.
        while (currentSize > this.maxTokens && this.messages.length > 0) {
            // Remove the oldest message
            this.messages.shift();
            // Re-calculate
            currentSize = this.estimateTokens(this.systemMessage) + this.getTotalTokens();
        }
    }

    private getTotalTokens(): number {
        return this.messages.reduce((sum, msg) => sum + this.estimateTokens(msg), 0);
    }

    /**
     * Estimates token count for effectiveness without heavy tokenizer dependency.
     */
    private estimateTokens(message: Message): number {
        return Math.ceil(message.content.length / ContextManager.CHARS_PER_TOKEN);
    }
    
    /**
     * Clear conversation history (keeps System Prompt).
     */
    public clear() {
        this.messages = [];
    }
}
