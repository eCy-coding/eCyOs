export type AgentRole = 'proposer' | 'critic' | 'judge' | 'analyst' | 'architect';

export interface DebateAgent {
  id: string;
  role: AgentRole;
  model: string;
  name: string;
  avatar: string;
  personality: string;
  systemPrompt: string;
}

export interface AgentArgument {
  agentId: string;
  content: string;
  timestamp: number;
}

export interface DebateRound {
  number: number;
  proposal?: AgentArgument;
  critique?: AgentArgument[];
  synthesis?: AgentArgument;
}

export interface DebateResult {
  id: string;
  topic: string;
  rounds: DebateRound[];
  consensus: string;
  confidence: number;
  status: 'active' | 'completed' | 'failed';
  agents: DebateAgent[];
  startTime: number;
  endTime?: number;
}
