// eCy OS v1005.0 - Cortex Slice
// Manages brain activity, thought streams, and telemetry data

import type { StateCreator } from 'zustand';
import type { CortexState, ThoughtStream, TelemetryData } from '../types';

export interface CortexSlice extends CortexState {
  addThought: (thought: Omit<ThoughtStream, 'id' | 'timestamp'>) => void;
  setActiveThink: (id: string | null) => void;
  updateTelemetry: (telemetry: Partial<TelemetryData>) => void;
  clearThoughts: () => void;
}

export const createCortexSlice: StateCreator<CortexSlice> = (set) => ({
  thoughts: [],
  activeThink: null,
  telemetry: {
    cpuUsage: 0,
    gpuUsage: 0,
    memoryUsage: 0,
    fps: 60
  },

  addThought: (thought) => set((state) => ({
    thoughts: [
      ...state.thoughts.slice(-99), // Keep last 100 thoughts for memory efficiency
      {
        ...thought,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      }
    ]
  })),

  setActiveThink: (id) => set({ activeThink: id }),

  updateTelemetry: (telemetry) => set((state) => ({
    telemetry: { ...state.telemetry, ...telemetry }
  })),

  clearThoughts: () => set({ thoughts: [], activeThink: null })
});
