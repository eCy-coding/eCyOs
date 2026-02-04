import { useIntelligence } from './UnifiedIntelligenceProvider';
import { create } from 'zustand';

export interface DebateStep {
    id: string;
    agent: string; // 'Proposer' | 'Critic' | 'Judge'
    model: string;
    content: string;
    status: 'thinking' | 'completed' | 'error';
    timestamp: number;
}

interface DebateState {
    steps: DebateStep[];
    isDebating: boolean;
    topic: string;
    addStep: (step: DebateStep) => void;
    updateStep: (id: string, updates: Partial<DebateStep>) => void;
    setTopic: (t: string) => void;
    setDebating: (d: boolean) => void;
    reset: () => void;
}

export const useDebateStore = create<DebateState>((set) => ({
    steps: [],
    isDebating: false,
    topic: '',
    addStep: (step) => set((state) => ({ steps: [...state.steps, step] })),
    updateStep: (id, updates) => set((state) => ({
        steps: state.steps.map((s) => s.id === id ? { ...s, ...updates } : s)
    })),
    setTopic: (t) => set({ topic: t }),
    setDebating: (d) => set({ isDebating: d }),
    reset: () => set({ steps: [], isDebating: false, topic: '' })
}));

export class DebateCoordinator {
    
    private static async think(modelId: string, prompt: string, role: string, stepId: string): Promise<string> {
        console.log(`[${role}] Thinking via ${modelId}...`); // Use role to silence warning
        const { queryModel } = useIntelligence.getState();
        const { updateStep } = useDebateStore.getState();

        try {
            // Simulate switching model in the provider (conceptually)
            useIntelligence.getState().selectModel(modelId);
            
            // Execute
            const response = await queryModel(prompt);
            
            updateStep(stepId, { 
                content: response, 
                status: 'completed',
                model: modelId // Record actual model used
            });
            
            return response;
        } catch (error) {
            updateStep(stepId, { 
                content: `Architecture Failure: ${error}`, 
                status: 'error' 
            });
            return "ERROR";
        }
    }

    static async startDebate(topic: string) {
        const store = useDebateStore.getState();
        store.reset();
        store.setTopic(topic);
        store.setDebating(true);

        // 1. PROPOSER PHASE (Creative)
        const propId = crypto.randomUUID();
        store.addStep({
            id: propId,
            agent: 'Proposer',
            model: 'openai/gpt-4o',
            content: 'Analyzing...',
            status: 'thinking',
            timestamp: Date.now()
        });
        
        const proposal = await this.think(
            'openai/gpt-4o', 
            `You are the Proposer. Provide a comprehensive, high-level solution for: "${topic}". Focus on innovation.`,
            'Proposer',
            propId
        );

        // 2. CRITIC PHASE (Analytical)
        const critId = crypto.randomUUID();
        store.addStep({
            id: critId,
            agent: 'Critic',
            model: 'anthropic/claude-3.5-sonnet',
            content: 'Reviewing...',
            status: 'thinking',
            timestamp: Date.now()
        });

        const critique = await this.think(
            'anthropic/claude-3.5-sonnet',
            `You are the Critic. Review this proposal for flaws, edge cases, and security risks:\n\n${proposal}`,
            'Critic',
            critId
        );

        // 3. JUDGE PHASE (Synthesizer)
        const judgeId = crypto.randomUUID();
        store.addStep({
            id: judgeId,
            agent: 'Judge',
            model: 'google/gemini-pro-1.5',
            content: 'Synthesizing...',
            status: 'thinking',
            timestamp: Date.now()
        });

        await this.think(
            'google/gemini-pro-1.5',
            `You are the Judge. Synthesize the Final Solution based on the Proposal and Critique.\n\nProposal: ${proposal}\n\nCritique: ${critique}\n\nProvide the "Ultimate Truth" implementation.`,
            'Judge',
            judgeId
        );

        store.setDebating(false);
    }
}
