import { type StateCreator } from 'zustand';

export interface Agent {
  id: string;
  name: string;
  role: 'proposer' | 'critic' | 'judge' | 'researcher';
  model: string; // OpenRouter model ID
  avatar: string; // URL or emoji
  color: string; // UI accent color
  systemPrompt: string;
}

export interface DebateMessage {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  type: 'proposal' | 'critique' | 'rebuttal' | 'verdict' | 'thought';
  confidence?: number; // 0-1
}

export interface IntelligenceState {
  // State
  agents: Agent[];
  activeDebateId: string | null;
  debateHistory: DebateMessage[];
  isDebating: boolean;
  currentTurn: string | null; // Agent ID
  topic: string | null;

  // Actions
  initializeCouncil: () => void;
  startDebate: (topic: string) => Promise<void>;
  addMessage: (message: Omit<DebateMessage, 'id' | 'timestamp'>) => void;
  stopDebate: () => void;
}

// Initial Council Members
const COUNCIL_MEMBERS: Agent[] = [
  {
    id: 'architect',
    name: 'Atlas (Architect)',
    role: 'proposer',
    model: 'anthropic/claude-3.5-sonnet',
    avatar: '🏛️',
    color: '#3b82f6', // Blue
    systemPrompt: "You are Atlas, a master software architect. You propose robust, scalable, and technically precise solutions. Focus on structure, patterns, and best practices."
  },
  {
    id: 'critic',
    name: 'Socrates (Critic)',
    role: 'critic',
    model: 'openai/gpt-4o',
    avatar: '⚖️',
    color: '#ef4444', // Red
    systemPrompt: "You are Socrates, a ruthless critic. You analyze proposals for security flaws, performance bottlenecks, and edge cases. You do not generate code, you destroy flaws."
  },
  {
    id: 'judge',
    name: 'Themis (Judge)',
    role: 'judge',
    model: 'google/gemini-pro-1.5',
    avatar: '👁️',
    color: '#a855f7', // Purple
    systemPrompt: "You are Themis, the impartial judge. You synthesize the Proposal and the Critique into a 'Final Verdict'. Your output is the 'Nihai Doğru' (Ultimate Truth). Be decisive."
  }
];

export const createIntelligenceSlice: StateCreator<IntelligenceState> = (set, get) => ({
  agents: [],
  activeDebateId: null,
  debateHistory: [],
  isDebating: false,
  currentTurn: null,
  topic: null,

  initializeCouncil: () => {
    set({ agents: COUNCIL_MEMBERS });
  },

  startDebate: async (topic: string) => {
    const { addMessage } = get(); // Remove 'agents' if unused, or use it
    set({ isDebating: true, debateHistory: [], topic });

    // 1. Initial User Query
    addMessage({
        agentId: 'user',
        content: `Topic: ${topic}`,
        type: 'thought'
    });

    // SIMULATION LOOP (Mocking OpenRouter for now)
    
    // Step 1: Architect
    set({ currentTurn: 'architect' });
    setTimeout(() => {
        addMessage({
            agentId: 'architect',
            content: `Analyzing "${topic}"... \n\nI propose a Domain-Driven Design approach. We should isolate the core logic into a 'Core' domain, independent of the UI. \n\nFolder Structure:\n- src/core (Business Logic)\n- src/ui (React Components)\n- src/infra (API/DB adapters)`,
            type: 'proposal'
        });
        
        // Step 2: Critic
        set({ currentTurn: 'critic' });
        setTimeout(() => {
            addMessage({
                agentId: 'critic',
                content: `Hold on. While DDD is solid, it adds unnecessary boilerplate for smaller modules. \n\nRisk Assessment:\n- Over-engineering for simple features.\n- High learning curve for new devs.\n\nWe need a pragmatic hybrid approach. Keep Feature-Sliced Design (FSD) in mind.`,
                type: 'critique'
            });

            // Step 3: Judge
            set({ currentTurn: 'judge' });
            setTimeout(() => {
                 addMessage({
                    agentId: 'judge',
                    content: `VERDICT: Sustained. We will adopt a modified Feature-Sliced Design.\n\nDecision:\n1. Group by Feature, not technical layer.\n2. Use 'shared' for generic UI components.\n3. Enforce strict boundaries with 'index.ts' exports.\n\nThis balances scalability with simplicity. Execution approved.`,
                    type: 'verdict'
                });
                set({ isDebating: false, currentTurn: null });
            }, 3000);

        }, 3000);

    }, 2000);
  },

  addMessage: (msg: Omit<DebateMessage, 'id' | 'timestamp'>) => set((state) => ({
    debateHistory: [...state.debateHistory, { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }]
  })),

  stopDebate: () => set({ isDebating: false, currentTurn: null })
});
