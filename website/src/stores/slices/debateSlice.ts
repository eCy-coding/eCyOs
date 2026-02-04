// eCy OS v1005.0 - Debate Slice
// Multi-agent orchestration for OpenRouter consensus debates

import type { StateCreator } from 'zustand';
import type { DebateState, DebateMessage, ConsensusResult } from '../types';

export interface DebateSlice extends DebateState {
  createDebate: (topic: string) => string;
  addMessage: (message: Omit<DebateMessage, 'id' | 'timestamp'>) => void;
  setConsensus: (consensus: ConsensusResult) => void;
  setStreaming: (isStreaming: boolean) => void;
  closeDebate: (debateId: string) => void;
  clearMessages: () => void;
}

export const createDebateSlice: StateCreator<DebateSlice> = (set) => ({
  debates: [],
  activeDebate: null,
  messages: [],
  consensus: null,
  isStreaming: false,

  createDebate: (topic) => {
    const debateId = crypto.randomUUID();
    set((state) => ({
      debates: [...state.debates, {
        id: debateId,
        topic,
        status: 'active',
        createdAt: Date.now()
      }],
      activeDebate: debateId,
      messages: [],
      consensus: null
    }));
    return debateId;
  },

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }]
  })),

  setConsensus: (consensus) => set((state) => ({
    consensus,
    debates: state.debates.map(d =>
      d.id === state.activeDebate
        ? { ...d, status: 'consensus_reached' as const }
        : d
    )
  })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  closeDebate: (debateId) => set((state) => ({
    debates: state.debates.map(d =>
      d.id === debateId ? { ...d, status: 'timeout' as const } : d
    ),
    activeDebate: state.activeDebate === debateId ? null : state.activeDebate
  })),

  clearMessages: () => set({ messages: [], consensus: null })
});
