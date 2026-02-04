// eCy OS v1005.0 - Store Type Definitions
// Comprehensive type system for Zustand state management

export interface CortexState {
  thoughts: ThoughtStream[];
  activeThink: string | null;
  telemetry: TelemetryData;
}

export interface ArtifactsState {
  files: ArtifactFile[];
  activeFile: string | null;
  history: FileHistory[];
}

export interface DebateState {
  debates: Debate[];
  activeDebate: string | null;
  messages: DebateMessage[];
  consensus: ConsensusResult | null;
  isStreaming: boolean;
}

export interface UIState {
  theme: 'cyberpunk' | 'minimal';
  activeTab: string;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
}

// Debate types for multi-agent orchestration
export interface Debate {
  id: string;
  topic: string;
  status: 'active' | 'consensus_reached' | 'timeout';
  createdAt: number;
}

export interface DebateMessage {
  id: string;
  debateId: string;
  agentRole: 'proposer' | 'critic' | 'judge';
  modelUsed: string;
  content: string;
  confidenceScore: number;
  timestamp: number;
}

export interface ConsensusResult {
  finalAnswer: string;
  confidence: number;
  rounds: number;
  modelVotes: Record<string, number>;
}

// Cortex types for brain activity
export interface ThoughtStream {
  id: string;
  content: string;
  timestamp: number;
  type: 'inference' | 'analysis' | 'synthesis';
}

export interface TelemetryData {
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  fps: number;
}

// Artifact types for code/document management
export interface ArtifactFile {
  id: string;
  name: string;
  content: string;
  language: string;
  lastModified: number;
}

export interface FileHistory {
  fileId: string;
  snapshot: string;
  timestamp: number;
}
