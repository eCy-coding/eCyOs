
import { Councilor } from '../council';
import axios from 'axios';

export class OpenAIAdapter implements Councilor {
    name: string;
    role: string;
    model: string;
    private apiKey: string;
    private baseUrl: string;

    constructor(name: string, role: string, model: string, apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
        this.name = name;
        this.role = role;
        this.model = model;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    private async prompt(system: string, user: string): Promise<string> {
        if (!this.apiKey) {
            return `[System] ${this.name} abstains (No API Key provided).`;
        }

        try {
            const response = await axios.post(`${this.baseUrl}/chat/completions`, {
                model: this.model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: user }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message.content;
        } catch (error: any) {
             return `[${this.name} Error] Connection failed: ${error.message}`;
        }
    }

    async contemplate(topic: string): Promise<string> {
        const system = `You are ${this.name}, a councilor with the role of "${this.role}".
        Analyze the given topic deeply. Provide a comprehensive position paper outlining your solution, reasoning, and any risks you foresee.`;
        return this.prompt(system, `Topic: ${topic}`);
    }

    async critique(position: string, author: string): Promise<string> {
        const system = `You are ${this.name}, with the role of "${this.role}".
        Critique the following position paper written by ${author}.`;
        return this.prompt(system, `Position by ${author}:\n${position}`);
    }

    async vote(context: string): Promise<string> {
        const system = `You are ${this.name}, with the role of "${this.role}".
        Review the full debate context. Synthesize the best possible solution and provide your Final Verdict.`;
        return this.prompt(system, `Debate Context:\n${context}`);
    }
}
