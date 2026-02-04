// Phase 6: Intelligence System Types
// Multi-agent debate, calculator modes, and knowledge graph structures

export type AgentRole = 'proposer' | 'critic' | 'judge';
export type DebateStatus = 'active' | 'consensus' | 'timeout';
export type CalculatorMode = 'scientific' | 'graphical' | 'programmer';
export type NumberBase = 'dec' | 'hex' | 'bin' | 'oct';

// Agent Configuration
export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  model: string; // OpenRouter model ID (e.g., 'openai/gpt-4o')
  avatar: string; // Emoji or icon
  systemPrompt?: string;
  temperature?: number;
}

// Debate Session
export interface DebateSession {
  id: string;
  topic: string;
  status: DebateStatus;
  consensusScore: number; // 0-1 scale
  rounds: DebateRound[];
  createdAt: Date;
  completedAt?: Date;
}

// Individual Round in Debate
export interface DebateRound {
  id: string;
  sessionId: string;
  roundNumber: number;
  agentId: string;
  position: string; // Agent's argument
  confidence: number; // 0-1 scale
  reasoning?: string; // Internal thought process
  timestamp: Date;
}

// Neural Activity Data (Cortex)
export interface NeuralData {
  id: string;
  timestamp: Date;
  activityLevel: number; // 0-100
  pattern: string; // e.g., 'wave', 'spike', 'calm'
  metadata?: Record<string, unknown>;
}

// Hardware Metrics (Cortex)
export interface HardwareMetrics {
  cpu: number; // 0-100 percentage
  gpu: number; // 0-100 percentage
  memory: number; // 0-100 percentage
  temperature?: number; // Celsius
  timestamp: Date;
}

// Document (Artifacts)
export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'markdown' | 'code' | 'json' | 'text';
  language?: string; // For code documents
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Knowledge Graph Node
export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'document' | 'agent' | 'event';
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  style?: {
    color?: string;
    size?: number;
    shape?: 'circle' | 'square' | 'diamond';
  };
}

// Knowledge Graph Edge
export interface KnowledgeEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  relation: string; // e.g., 'related_to', 'created_by', 'references'
  weight?: number; // 0-1 strength of connection
  animated?: boolean;
}

// Calculator History Entry
export interface CalculationEntry {
  id: string;
  mode: CalculatorMode;
  expression: string;
  result: string | number;
  timestamp: Date;
  base?: NumberBase; // For programmer mode
}

// OpenRouter API Types
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          role: AgentRole;
          model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: AgentRole;
          model: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: AgentRole;
          model?: string;
          created_at?: string;
        };
      };
      debate_sessions: {
        Row: {
          id: string;
          topic: string;
          status: DebateStatus;
          consensus_score: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          topic: string;
          status?: DebateStatus;
          consensus_score?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          topic?: string;
          status?: DebateStatus;
          consensus_score?: number;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      debate_rounds: {
        Row: {
          id: string;
          session_id: string;
          round_number: number;
          agent_id: string;
          position: string;
          confidence: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          round_number: number;
          agent_id: string;
          position: string;
          confidence: number;
          timestamp?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          round_number?: number;
          agent_id?: string;
          position?: string;
          confidence?: number;
          timestamp?: string;
        };
      };
    };
  };
}
