// eCy OS v1005.0 - Main Zustand Store
// Enterprise-grade state management with middleware stack

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createCortexSlice, type CortexSlice } from './slices/cortexSlice';
import { createDebateSlice, type DebateSlice } from './slices/debateSlice';
import { createUISlice, type UISlice } from './slices/uiSlice';
import { createUtilitiesSlice, type UtilitiesSlice } from './slices/utilitiesSlice';
import { createArtifactsSlice, type ArtifactsSlice } from './slices/artifactsSlice';
import { createOuroborosSlice, type OuroborosSlice } from './slices/ouroborosSlice';

// Legacy exports for backward compatibility
export { useCortexStore } from './cortexStore';
export { useArtifactsStore } from './artifactsStore';
export { useOuroborosStore } from './ouroborosStore';
export type { Agent, Thought, Telemetry } from './cortexStore';
export type { Artifact } from './artifactsStore';
export type { FeedbackLoop, PerformanceMetric } from './ouroborosStore';

// Combined store type
type StoreState = CortexSlice & DebateSlice & UISlice & UtilitiesSlice & ArtifactsSlice & OuroborosSlice;

// Create store with middleware stack: Devtools -> Persist
export const useAppStore = create<StoreState>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...createCortexSlice(set, get, api),
        ...createDebateSlice(set, get, api),
        ...createUISlice(set, get, api),
        ...createUtilitiesSlice(set, get, api),
        ...createArtifactsSlice(set, get, api),
        ...createOuroborosSlice(set, get, api)
      }),
      {
        name: 'ecy-os-storage',
        // Only persist non-transient data
        partialize: (state) => ({
          debates: state.debates,
          thoughts: state.thoughts.slice(-50), // Keep last 50 thoughts
          theme: state.theme,
          activeTab: state.activeTab,
          sidebarOpen: state.sidebarOpen,
          history: state.history.slice(-100), // Keep last 100 utility operations
          favorites: state.favorites,
          documents: state.documents, // Phase 6: Artifacts
          agents: state.agents, // Phase 6: Ouroboros
          debateSessions: state.debateSessions.filter(s => s.status !== 'active') // Phase 6: Only completed debates
        })
      }
    ),
    { name: 'eCy OS Store' }
  )
);

// ==========================================
// ATOMIC SELECTORS (Performance Optimized)
// ==========================================

// Cortex selectors
export const useCortexThoughts = () => useAppStore(state => state.thoughts);
export const useActiveThink = () => useAppStore(state => state.activeThink);
export const useActiveTelemetry = () => useAppStore(state => state.telemetry);

// Debate selectors
export const useDebates = () => useAppStore(state => state.debates);
export const useActiveDebate = () => useAppStore(state => 
  state.debates.find(d => d.id === state.activeDebate)
);
export const useDebateMessages = () => useAppStore(state => state.messages);
export const useConsensus = () => useAppStore(state => state.consensus);
export const useIsStreaming = () => useAppStore(state => state.isStreaming);

// UI selectors
export const useTheme = () => useAppStore(state => state.theme);
export const useActiveTab = () => useAppStore(state => state.activeTab);
export const useSidebarOpen = () => useAppStore(state => state.sidebarOpen);
export const useCommandPaletteOpen = () => useAppStore(state => state.commandPaletteOpen);

// ==========================================
// ACTION HOOKS (Recommended Pattern)
// ==========================================

export const useCortexActions = () => useAppStore(state => ({
  addThought: state.addThought,
  setActiveThink: state.setActiveThink,
  updateTelemetry: state.updateTelemetry,
  clearThoughts: state.clearThoughts
}));

export const useDebateActions = () => useAppStore(state => ({
  createDebate: state.createDebate,
  addMessage: state.addMessage,
  setConsensus: state.setConsensus,
  setStreaming: state.setStreaming,
  closeDebate: state.closeDebate,
  clearMessages: state.clearMessages
}));

export const useUIActions = () => useAppStore(state => ({
  setTheme: state.setTheme,
  setActiveTab: state.setActiveTab,
  toggleSidebar: state.toggleSidebar,
  toggleCommandPalette: state.toggleCommandPalette,
  setSidebarOpen: state.setSidebarOpen,
  setCommandPaletteOpen: state.setCommandPaletteOpen
}));

// ==========================================
// PHASE 6: ARTIFACTS & OUROBOROS SELECTORS
// ==========================================

// Artifacts selectors
export const useDocuments = () => useAppStore(state => state.documents);
export const useCurrentDocument = () => useAppStore(state => {
  const doc = state.documents.find(d => d.id === state.currentDocId);
  return doc;
});
export const useSearchQuery = () => useAppStore(state => state.searchQuery);

// Ouroboros selectors
export const useAgents = () => useAppStore(state => state.agents);
export const useDebateSessions = () => useAppStore(state => state.debateSessions);
export const useActiveDebateSession = () => useAppStore(state => state.getActiveSession());

// Artifacts actions
export const useArtifactsActions = () => useAppStore(state => ({
  saveDocument: state.saveDocument,
  deleteDocument: state.deleteDocument,
  setCurrentDoc: state.setCurrentDoc,
  setSearchQuery: state.setSearchQuery,
  searchDocuments: state.searchDocuments
}));

// Ouroboros actions
export const useOuroborosActions = () => useAppStore(state => ({
  registerAgent: state.registerAgent,
  unregisterAgent: state.unregisterAgent,
  updateAgent: state.updateAgent,
  createDebateSession: state.createDebateSession,
  addDebateRound: state.addDebateRound,
  updateConsensusScore: state.updateConsensusScore,
  completeSession: state.completeSession,
  setActiveSession: state.setActiveSession
}));

