// Phase 6: Artifacts Slice - Document Management
// Integrated with existing Zustand store structure

import type { StateCreator } from 'zustand';
import type { Document } from '../../types/intelligence';

export interface ArtifactsSlice {
  // State
  documents: Document[];
  currentDocId: string | null;
  searchQuery: string;
  
  // Actions
  saveDocument: (doc: Document) => void;
  deleteDocument: (id: string) => void;
  setCurrentDoc: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  getDocumentById: (id: string) => Document | undefined;
  searchDocuments: (query: string) => Document[];
}

export const createArtifactsSlice: StateCreator<
  ArtifactsSlice,
  [],
  [],
  ArtifactsSlice
> = (set, get) => ({
  // Initial state
  documents: [],
  currentDocId: null,
  searchQuery: '',
  
  // Actions
  saveDocument: (doc) => set((state) => {
    const existingIndex = state.documents.findIndex((d) => d.id === doc.id);
    const documents = [...state.documents];
    
    if (existingIndex >= 0) {
      // Update existing document
      documents[existingIndex] = {
        ...doc,
        updatedAt: new Date(),
        version: documents[existingIndex].version + 1,
      };
    } else {
      // Add new document
      documents.push({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      });
    }
    
    return { documents };
  }),
  
  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter((d) => d.id !== id),
    currentDocId: state.currentDocId === id ? null : state.currentDocId,
  })),
  
  setCurrentDoc: (id) => set({ currentDocId: id }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getDocumentById: (id) => {
    return get().documents.find((d) => d.id === id);
  },
  
  searchDocuments: (query) => {
    const { documents } = get();
    if (!query.trim()) return documents;
    
    const lowerQuery = query.toLowerCase();
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },
});
