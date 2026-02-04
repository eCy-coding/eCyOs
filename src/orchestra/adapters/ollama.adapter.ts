import { Councilor } from '../council';
import axios from 'axios';
import { OSSCPrompts } from '../prompts';

export class OllamaAdapter implements Councilor {
    name: string;
    role: string;
    model: string;
    private baseUrl: string;

    constructor(name: string, role: string, model: string = 'qwen2.5:7b', baseUrl: string = 'http://localhost:11434') {
        this.name = name;
        this.role = role;
        this.model = model;
        this.baseUrl = baseUrl;
    }

    private async prompt(system: string, user: string, options: any = {}): Promise<string> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/chat`, {
                model: this.model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: user }
                ],
                stream: false,
                options: { 
                    temperature: options.temperature ?? 0.7,
                    seed: options.seed // Optional for determinism
                }
            });
            return response.data.message.content;
        } catch (error: any) {
            return `[Ollama Error] Could not generate thought: ${error.message}`;
        }
    }

    private getPersona(): string {
        switch (this.role) {
            case 'The Architect': return OSSCPrompts.ARCHITECT;
            case 'The Critic': return OSSCPrompts.CRITIC;
            case 'The Skeptic': return OSSCPrompts.CRITIC;
            case 'The Coder': return OSSCPrompts.CODER;
            case 'The Logician': return OSSCPrompts.DEBUGGER; // Approximate mapping
            default: return `Act as ${this.role}.`; // Fallback
        }
    }

    async contemplate(topic: string): Promise<string> {
        const system = this.getPersona();
        return this.prompt(system, `Topic: ${topic}`);
    }

    async critique(position: string, author: string): Promise<string> {
        const system = this.getPersona() + '\nMission: Critique the following position.';
        return this.prompt(system, `Position by ${author}:\n${position}`);
    }

    async vote(context: string): Promise<string> {
        const system = OSSCPrompts.SOVEREIGN + `\nYou are acting as ${this.name} (${this.role}).`;
        return this.prompt(system, `Debate Context:\n${context}`);
    }

    // Direct interface for Brain usage
    public async ask(prompt: string, system: string = OSSCPrompts.ARCHITECT, options: any = {}): Promise<string> {
        return this.prompt(system, prompt, options);
    }

    public async askStream(prompt: string, onToken: (token: string) => void, system: string = OSSCPrompts.ARCHITECT, options: any = {}): Promise<void> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/chat`, {
                model: this.model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: prompt }
                ],
                stream: true,
                options: { 
                    temperature: options.temperature ?? 0.7,
                    seed: options.seed
                }
            }, { responseType: 'stream' });

            const stream = response.data;
            let buffer = '';
            const BATCH_SIZE = 50; // Optimization: Batch tokens before sending

            stream.on('data', (chunk: Buffer) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.message && json.message.content) {
                            buffer += json.message.content;
                            if (buffer.length >= BATCH_SIZE) {
                                onToken(buffer);
                                buffer = '';
                            }
                        }
                        if (json.done) {
                            if (buffer.length > 0) onToken(buffer); // Flush remaining
                        }
                    } catch (e) {
                        // Ignore parse errors for partial chunks (common in streams)
                    }
                }
            });

            return new Promise((resolve, reject) => {
                stream.on('end', () => {
                    if (buffer.length > 0) onToken(buffer);
                    resolve();
                });
                stream.on('error', (err: any) => reject(err));
            });

        } catch (error: any) {
            console.error('[Ollama Stream Error]', error);
            onToken(`[Error: ${error.message}]`);
        }
    }
}
