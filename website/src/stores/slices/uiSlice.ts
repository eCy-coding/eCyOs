// eCy OS v1005.0 - UI Slice
// User interface state management for tabs, theme, sidebar, command palette

import type { StateCreator } from 'zustand';
import type { UIState } from '../types';

export interface UISlice extends UIState {
  setTheme: (theme: 'cyberpunk' | 'minimal') => void;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  theme: 'cyberpunk',
  activeTab: 'home',
  sidebarOpen: true,
  commandPaletteOpen: false,

  setTheme: (theme) => set({ theme }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  toggleCommandPalette: () => set((state) => ({ 
    commandPaletteOpen: !state.commandPaletteOpen 
  })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open })
});
