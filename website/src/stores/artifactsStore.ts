import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Artifact {
  id: string;
  name: string;
  type: 'code' | 'document' | 'data' | 'image';
  content: string;
  metadata: {
    createdAt: number;
    updatedAt: number;
    author: string;
    tags: string[];
  };
}

interface ArtifactsState {
  artifacts: Artifact[];
  selectedId: string | null;
  
  addArtifact: (artifact: Omit<Artifact, 'id' | 'metadata'>) => void;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  deleteArtifact: (id: string) => void;
  selectArtifact: (id: string | null) => void;
  getArtifact: (id: string) => Artifact | undefined;
  searchArtifacts: (query: string) => Artifact[];
}

export const useArtifactsStore = create<ArtifactsState>()(
  devtools(
    persist(
      immer((set, get) => ({
        artifacts: [],
        selectedId: null,
        
        addArtifact: (artifact) => set((state) => {
          const newArtifact: Artifact = {
            ...artifact,
            id: `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              author: 'eCy OS',
              tags: [],
            },
          };
          state.artifacts.push(newArtifact);
        }),
        
        updateArtifact: (id, updates) => set((state) => {
          const artifact = state.artifacts.find(a => a.id === id);
          if (artifact) {
            Object.assign(artifact, updates);
            artifact.metadata.updatedAt = Date.now();
          }
        }),
        
        deleteArtifact: (id) => set((state) => {
          state.artifacts = state.artifacts.filter(a => a.id !== id);
          if (state.selectedId === id) {
            state.selectedId = null;
          }
        }),
        
        selectArtifact: (id) => set({ selectedId: id }),
        
        getArtifact: (id) => get().artifacts.find(a => a.id === id),
        
        searchArtifacts: (query) => {
          const normalizedQuery = query.toLowerCase();
          return get().artifacts.filter(a => 
            a.name.toLowerCase().includes(normalizedQuery) ||
            a.content.toLowerCase().includes(normalizedQuery) ||
            a.metadata.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
          );
        },
      })),
      {
        name: 'artifacts-storage',
      }
    ),
    { name: 'ArtifactsStore' }
  )
);
