// eCy OS v1005.0 - Utilities Zustand Slice
// Shared state for all 14 utility apps

import type { StateCreator } from 'zustand';

export interface UtilityHistoryItem {
  id: string;
  appName: string;
  input: string;
  output: string;
  timestamp: number;
}

export interface UtilitiesSlice {
  history: UtilityHistoryItem[];
  favorites: string[];
  
  // Actions
  addHistory: (item: Omit<UtilityHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: (appName?: string) => void;
  toggleFavorite: (appName: string) => void;
  getAppHistory: (appName: string) => UtilityHistoryItem[];
}

export const createUtilitiesSlice: StateCreator<UtilitiesSlice> = (set, get) => ({
  history: [],
  favorites: [],
  
  addHistory: (item) => set((state) => ({
    history: [
      ...state.history.slice(-99), // Keep last 100 items total
      {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      }
    ]
  })),
  
  clearHistory: (appName) => set((state) => ({
    history: appName 
      ? state.history.filter(h => h.appName !== appName)
      : []
  })),
  
  toggleFavorite: (appName) => set((state) => ({
    favorites: state.favorites.includes(appName)
      ? state.favorites.filter(f => f !== appName)
      : [...state.favorites, appName]
  })),
  
  getAppHistory: (appName) => {
    return get().history.filter(h => h.appName === appName).slice(-20); // Last 20 per app
  }
});
