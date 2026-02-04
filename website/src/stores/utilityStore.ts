// eCy OS v1005.0 - Utility Apps Zustand Store
// Centralized state management for 15 utility applications
// MIT/Google Standards - Strict TypeScript

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { UtilityStore, UtilityApp, DataBridgePayload } from '../types/utility';

/**
 * Zustand store for utility app management
 * Features: Persistence, DevTools integration, Strict typing
 */
export const useUtilityStore = create<UtilityStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        apps: [],
        activeAppId: null,
        dataBridge: null,

        // Register a new utility app
        registerApp: (app: UtilityApp) => {
          set((state) => {
            // Prevent duplicates
            if (state.apps.find(a => a.id === app.id)) {
              console.warn(`[UtilityStore] App "${app.id}" already registered`);
              return state;
            }

            // Add app sorted by priority
            const newApps = [...state.apps, app].sort(
              (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
            );

            return { apps: newApps };
          });
        },

        // Set active utility app
        setActiveApp: (appId: string) => {
          const app = get().apps.find(a => a.id === appId);
          
          if (!app) {
            console.error(`[UtilityStore] App "${appId}" not found`);
            return;
          }

          set({ activeAppId: appId });
        },

        // Export data from an app
        exportData: (payload: DataBridgePayload) => {
          set({ dataBridge: payload });
          
          // Auto-clear after 30 seconds to prevent stale data
          setTimeout(() => {
            set((state) => {
              if (state.dataBridge?.timestamp === payload.timestamp) {
                return { dataBridge: null };
              }
              return state;
            });
          }, 30000);
        },

        // Import data for target app
        importData: (targetAppId: string) => {
          const { dataBridge } = get();
          
          if (!dataBridge) {
            console.warn(`[UtilityStore] No data available for import`);
            return null;
          }

          console.log(`[UtilityStore] Importing data to "${targetAppId}"`);
          return dataBridge;
        },
      }),
      {
        name: 'ecy-utility-store', // LocalStorage key
        partialize: (state) => ({
          // Only persist essential state
          activeAppId: state.activeAppId,
        }),
      }
    ),
    { name: 'UtilityStore' } // Redux DevTools name
  )
);

/**
 * Helper hook to get app by ID
 */
export const useUtilityApp = (appId: string) => {
  return useUtilityStore(state => state.apps.find(app => app.id === appId));
};

/**
 * Helper hook to get apps by category
 */
export const useUtilityAppsByCategory = (category: string) => {
  return useUtilityStore(state => state.apps.filter(app => app.category === category));
};
