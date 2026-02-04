import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Strict TypeScript Interfaces (NO 'any')
export interface Agent {
  id: string;
  name: string;
  model: string;
  status: 'idle' | 'thinking' | 'responding';
  lastActive: number;
}

export interface Thought {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  type: 'proposal' | 'criticism' | 'verdict';
}

export interface Telemetry {
  cpu: number;
  ram: string;
  agents: number;
  timestamp: number;
}

interface CortexState {
  // State
  isConnected: boolean;
  agents: Agent[];
  thoughtStream: Thought[];
  telemetry: Telemetry;
  codeStream: string;
  terminalLines: string[];
  
  // Actions
  setConnected: (connected: boolean) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  addThought: (content: string, agentId?: string) => void;
  setCode: (code: string) => void;
  updateTelemetry: (data: Partial<Telemetry>) => void;
  addTerminalLine: (line: string) => void;
  clearThoughts: () => void;
  reset: () => void;
}

const initialState = {
  isConnected: false,
  agents: [],
  thoughtStream: [],
  telemetry: { cpu: 0, ram: '0%', agents: 0, timestamp: Date.now() },
  codeStream: '',
  terminalLines: [],
};

export const useCortexStore = create<CortexState>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,
        
        setConnected: (connected) => set((state) => {
          state.isConnected = connected;
        }),
        
        addAgent: (agent) => set((state) => {
          state.agents.push(agent);
        }),
        
        removeAgent: (id) => set((state) => {
          state.agents = state.agents.filter(a => a.id !== id);
        }),
        
        addThought: (content, agentId = 'system') => set((state) => {
          const thought: Thought = {
            id: `thought-${Date.now()}`,
            agentId,
            content,
            timestamp: Date.now(),
            type: 'proposal'
          };
          state.thoughtStream.push(thought);
          // Keep only last 100 thoughts
          if (state.thoughtStream.length > 100) {
            state.thoughtStream = state.thoughtStream.slice(-100);
          }
        }),
        
        setCode: (code) => set((state) => {
          state.codeStream = code;
        }),
        
        updateTelemetry: (data) => set((state) => {
          state.telemetry = { ...state.telemetry, ...data, timestamp: Date.now() };
        }),
        
        addTerminalLine: (line) => set((state) => {
          state.terminalLines.push(line);
          // Keep only last 500 lines
          if (state.terminalLines.length > 500) {
            state.terminalLines = state.terminalLines.slice(-500);
          }
        }),
        
        clearThoughts: () => set((state) => {
          state.thoughtStream = [];
        }),
        
        reset: () => set(initialState),
      })),
      {
        name: 'cortex-storage',
        partialize: (state) => ({
          // Only persist non-volatile data
          agents: state.agents,
        }),
      }
    ),
    { name: 'CortexStore' }
  )
);
