import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createIntelligenceSlice, type IntelligenceState } from './intelligenceSlice';

// --- Interfaces (Atomic Typing) ---

// 1. Brain/Cortex Slice
interface TelemetryData {
    cpu: number;
    memory: string; // "16GB" or "45%"
    agents: number;
}

interface BrainState {
    isConnected: boolean;
    thoughtStream: string[];
    codeStream: string;
    telemetry: TelemetryData;
    terminalLines: string[]; // Ouroboros Logs
    
    // Actions
    setConnected: (status: boolean) => void;
    addThought: (thought: string) => void;
    setCode: (code: string) => void;
    updateTelemetry: (data: Partial<TelemetryData>) => void;
    addTerminalLine: (line: string) => void;
}

// 2. Artifacts Slice (File System)
export interface ArtifactNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    path: string;
    children?: ArtifactNode[];
    content?: string; // Loaded on demand
    lastModified?: number;
    icon?: React.ReactNode;
}

interface ArtifactState {
    root: ArtifactNode[];
    activeFile: ArtifactNode | null;
    expandedFolders: Set<string>;
    
    // Actions
    setRoot: (nodes: ArtifactNode[]) => void;
    setActiveFile: (node: ArtifactNode | null) => void;
    toggleFolder: (path: string) => void;
}

// 3. Ouroboros Slice (System Health & Self-Healing)
interface OuroborosState {
    systemStatus: 'healthy' | 'healing' | 'critical';
    activeProtocol: string | null;
    healingLog: string[];
    
    // Actions
    setStatus: (status: 'healthy' | 'healing' | 'critical') => void;
    logHealing: (msg: string) => void;
}

// --- Combined Store ---

interface AppState extends BrainState, ArtifactState, OuroborosState, IntelligenceState {}

export const useStore = create<AppState>()(
    devtools(
        (set, get, api) => ({
            // Brain Slice
            isConnected: false,
            thoughtStream: [],
            codeStream: "",
            telemetry: { cpu: 0, memory: "0%", agents: 0 },
            terminalLines: [],

            setConnected: (status) => set({ isConnected: status }),
            addThought: (thought) => set((state) => ({ thoughtStream: [thought, ...state.thoughtStream].slice(0, 50) })),
            setCode: (code) => set({ codeStream: code }),
            updateTelemetry: (data) => set((state) => ({ telemetry: { ...state.telemetry, ...data } })),
            addTerminalLine: (line) => set((state) => ({ terminalLines: [...state.terminalLines, line].slice(-50) })),

            // Artifact Slice
            root: [], // Initial state, populated by API
            activeFile: null,
            expandedFolders: new Set(),

            setRoot: (nodes) => set({ root: nodes }),
            setActiveFile: (node) => set({ activeFile: node }),
            toggleFolder: (path) => set((state) => {
                const newExpanded = new Set(state.expandedFolders);
                if (newExpanded.has(path)) newExpanded.delete(path);
                else newExpanded.add(path);
                return { expandedFolders: newExpanded };
            }),

            // Ouroboros Slice
            systemStatus: 'healthy',
            activeProtocol: null,
            healingLog: [],

            setStatus: (status) => set({ systemStatus: status }),
            logHealing: (msg) => set((state) => ({ healingLog: [msg, ...state.healingLog].slice(0, 20) })),

            // Intelligence Slice (The Council)
            ...createIntelligenceSlice(set, get, api),
        }),
        { name: 'eCy-OS-Store' }
    )
);
