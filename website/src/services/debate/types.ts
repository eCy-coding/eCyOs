/**
 * Multi-Agent Debate System Types
 */

export type AgentRole = 'proposer' | 'critic' | 'judge' | 'synthesizer';

export interface AgentModels {
  proposer: string;
  critic: string;
  judge: string;
  synthesizer: string;
}

export interface AgentResponse {
  agent: AgentRole;
  model: string;
  content: string;
  confidence: number;
  timestamp: Date;
}

export interface Round {
  number: number;
  responses: AgentResponse[];
}

export type ConsensusVerdict = 'UNANIMOUS' | 'MAJORITY' | 'WEIGHTED' | 'FORCED';

export interface Consensus {
  verdict: ConsensusVerdict;
  confidence: number;
  finalAnswer: string;
  evidence: string[];
  reasoning?: string;
}

export type DebateStatus = 
  | 'ACTIVE' 
  | 'CONSENSUS' 
  | 'MAX_ROUNDS_REACHED' 
  | 'FAILED';

export interface DebateSession {
  id: string;
  topic: string;
  rounds: Round[];
  status: DebateStatus;
  models: AgentModels;
  consensus?: Consensus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DebateConfig {
  maxRounds?: number;
  consensusThreshold?: number;
  enableStreaming?: boolean;
}

export const DEFAULT_DEBATE_CONFIG: Required<DebateConfig> = {
  maxRounds: 7,
  consensusThreshold: 0.75,
  enableStreaming: false
};
