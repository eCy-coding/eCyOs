import { Councilor } from '../council';
import axios from 'axios';
import { OSSCPrompts } from '../prompts';

export class GeminiAdapter implements Councilor {
    name: string;
    role: string;
    model: string;
    private apiKey: string;
    private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';

    constructor(name: string, role: string, model: string = 'gemini-2.5-pro') {
        this.name = name;
        this.role = role;
        this.model = model;
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            console.error('Gemini API key is missing. Set GEMINI_API_KEY environment variable.');
            this.apiKey = '';
        } else {
            this.apiKey = key;
        }
    }






    private async prompt(system: string, user: string): Promise<string> {
        try {
            // Gemini API format: { contents: [{ parts: [{ text: "..." }] }], systemInstruction: ... }
            const response = await axios.post(`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`, {
                contents: [
                    { role: 'user', parts: [{ text: `System Context: ${system}\n\nTask: ${user}` }] } 
                    // Note: API v1beta systemInstruction is supported but putting it in user prompt is more portable for now unless verified.
                    // Let's stick to the simplest prompt structure that works for reasoning.
                ],
                generationConfig: {
                    temperature: 0.7
                }
            });
            
            const candidate = response.data.candidates?.[0];
            if (candidate && candidate.content && candidate.content.parts) {
                return candidate.content.parts.map((p: any) => p.text).join('');
            }
            return `[Gemini] No content generated.`;
        } catch (error: any) {
            console.error('Gemini Error:', error.response?.data || error.message);
            return `[Gemini Error] ${error.message}`;
        }
    }



    private getPersona(): string {
        switch (this.role) {
            case 'The Architect': return OSSCPrompts.ARCHITECT;
            case 'The Critic': return OSSCPrompts.CRITIC;
            case 'The Skeptic': return OSSCPrompts.CRITIC;
            case 'The Coder': return OSSCPrompts.CODER;
            case 'The Logician': return OSSCPrompts.DEBUGGER;
            default: return `Act as ${this.role}.`;
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
}
