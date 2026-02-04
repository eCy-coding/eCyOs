// Phase 6: Ouroboros Slice - Agent Orchestration & Multi-Agent Debates
// Integrated with existing Zustand store structure

import type { StateCreator } from 'zustand';
import type { Agent, DebateSession, DebateRound, DebateStatus } from '../../types/intelligence';

export interface OuroborosSlice {
  // State
  agents: Agent[];
  debateSessions: DebateSession[];
  activeSessionId: string | null;
  
  // Actions
  registerAgent: (agent: Agent) => void;
  unregisterAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  createDebateSession: (topic: string) => string;
  addDebateRound: (round: DebateRound) => void;
  updateConsensusScore: (sessionId: string, score: number) => void;
  completeSession: (sessionId: string, status: DebateStatus) => void;
  setActiveSession: (id: string | null) => void;
  getActiveSession: () => DebateSession | undefined;
  getAgentById: (id: string) => Agent | undefined;
}

export const createOuroborosSlice: StateCreator<
  OuroborosSlice,
  [],
  [],
  OuroborosSlice
> = (set, get) => ({
  // Initial state
  agents: [],
  debateSessions: [],
  activeSessionId: null,
  
  // Actions
  registerAgent: (agent) => set((state) => {
    const exists = state.agents.some((a) => a.id === agent.id);
    if (exists) return {}; // Already registered
    
    return {
      agents: [...state.agents, agent],
    };
  }),
  
   unregisterAgent: (id) => set((state) => ({
    agents: state.agents.filter((a) => a.id !== id),
  })),
  
  updateAgent: (id, updates) => set((state) => {
    const agents = state.agents.map((agent) =>
      agent.id === id ? { ...agent, ...updates } : agent
    );
    return { agents };
  }),
  
  createDebateSession: (topic) => {
    const sessionId = `debate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSession: DebateSession = {
      id: sessionId,
      topic,
      status: 'active',
      consensusScore: 0,
      rounds: [],
      createdAt: new Date(),
    };
    
    set((state) => ({
      debateSessions: [...state.debateSessions, newSession],
      activeSessionId: sessionId,
    }));
    
    return sessionId;
  },
  
  addDebateRound: (round) => set((state) => {
    const sessions = state.debateSessions.map((session) => {
      if (session.id === round.sessionId) {
        return {
          ...session,
          rounds: [...session.rounds, round],
        };
      }
      return session;
    });
    
    return { debateSessions: sessions };
  }),
  
  updateConsensusScore: (sessionId, score) => set((state) => {
    const sessions = state.debateSessions.map((session) => {
      if (session.id === sessionId) {
        return { ...session, consensusScore: score };
      }
      return session;
    });
    
    return { debateSessions: sessions };
  }),
  
  completeSession: (sessionId, status) => set((state) => {
    const sessions = state.debateSessions.map((session) => {
      if (session.id === sessionId) {
        return {
          ...session,
          status,
          completedAt: new Date(),
        };
      }
      return session;
    });
    
    return {
      debateSessions: sessions,
      activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
    };
  }),
  
  setActiveSession: (id) => set({ activeSessionId: id }),
  
  getActiveSession: () => {
    const { debateSessions, activeSessionId } = get();
    return debateSessions.find((s) => s.id === activeSessionId);
  },
  
  getAgentById: (id) => {
    return get().agents.find((a) => a.id === id);
  },
});
