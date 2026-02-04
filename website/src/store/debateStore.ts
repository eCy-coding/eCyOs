import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { DebateCoordinator } from '../services/debate/DebateCoordinator';
import type {
  DebateSession,
  AgentModels,
  Round,
  Consensus
} from '../services/debate';

// Default free models
const FREE_MODEL_CONFIG: AgentModels = {
  proposer: 'google/gemini-2.0-flash-exp:free',
  critic: 'google/gemini-2.0-flash-exp:free',
  judge: 'google/gemini-2.0-flash-exp:free',
  synthesizer: 'google/gemini-2.0-flash-exp:free'
};

interface DebateState {
  // State
  activeDebates: Map<string, DebateSession>;
  debateHistory: DebateSession[];
  selectedModels: AgentModels;
  isDebating: boolean;
  error: string | null;

  // Actions
  startDebate: (topic: string) => Promise<void>;
  updateDebateRound: (debateId: string, round: Round) => void;
  finalizeDebate: (debateId: string, consensus: Consensus) => void;
  setSelectedModels: (models: AgentModels) => void;
  clearError: () => void;
  resetDebates: () => void;
}

export const useDebateStore = create<DebateState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        activeDebates: new Map(),
        debateHistory: [],
        selectedModels: { ...FREE_MODEL_CONFIG }, // Start with free models
        isDebating: false,
        error: null,

        // Start a new debate
        startDebate: async (topic: string) => {
          if (!topic.trim()) {
            set({ error: 'Topic cannot be empty' });
            return;
          }

          set({ isDebating: true, error: null });

          try {
            const coordinator = new DebateCoordinator();
            const { selectedModels } = get();

            console.log('[DebateStore] Starting debate with models:', selectedModels);

            const session = await coordinator.startDebate(topic, selectedModels);

            set(state => {
              const newActive = new Map(state.activeDebates);
              newActive.set(session.id, session);
              
              return {
                activeDebates: newActive,
                isDebating: false
              };
            });

            console.log('[DebateStore] Debate completed:', session.id);
          } catch (error) {
            console.error('[DebateStore] Debate failed:', error);
            set({
              isDebating: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        },

        // Update debate with new round (for real-time updates)
        updateDebateRound: (debateId, round) => {
          set(state => {
            const debate = state.activeDebates.get(debateId);
            if (!debate) {
              console.warn(`[DebateStore] Debate ${debateId} not found`);
              return state;
            }

            debate.rounds.push(round);
            debate.updatedAt = new Date();

            const newActive = new Map(state.activeDebates);
            newActive.set(debateId, debate);

            return { activeDebates: newActive };
          });
        },

        // Finalize debate and move to history
        finalizeDebate: (debateId, consensus) => {
          set(state => {
            const debate = state.activeDebates.get(debateId);
            if (!debate) {
              console.warn(`[DebateStore] Debate ${debateId} not found`);
              return state;
            }

            debate.consensus = consensus;
            debate.status = 'CONSENSUS';
            debate.updatedAt = new Date();

            const newActive = new Map(state.activeDebates);
            newActive.delete(debateId);

            return {
              activeDebates: newActive,
              debateHistory: [...state.debateHistory, debate]
            };
          });
        },

        // Set selected models (user can override)
        setSelectedModels: (models) => {
          console.log('[DebateStore] Setting models:', models);
          set({ selectedModels: models });
        },

        // Clear error message
        clearError: () => set({ error: null }),

        // Reset all debates (for testing)
        resetDebates: () => set({
          activeDebates: new Map(),
          debateHistory: [],
          isDebating: false,
          error: null
        })
      }),
      {
        name: 'debate-store',
        version: 1,
        // Only persist debate history and selected models
        partialize: (state) => ({
          debateHistory: state.debateHistory,
          selectedModels: state.selectedModels
        })
      }
    ),
    { name: 'DebateStore' }
  )
);

// Selectors for optimized re-renders
export const useActiveDebates = () => useDebateStore(state => state.activeDebates);
export const useDebateHistory = () => useDebateStore(state => state.debateHistory);
export const useIsDebating = () => useDebateStore(state => state.isDebating);
export const useDebateError = () => useDebateStore(state => state.error);
export const useSelectedModels = () => useDebateStore(state => state.selectedModels);
