import { openRouter, type Message } from '../services/openrouter';
import type { DebateAgent, DebateResult, DebateRound } from './types';
import { v4 as uuidv4 } from 'uuid';

const AGENT_TEMPLATES: DebateAgent[] = [
  {
    id: 'agent-proposer',
    role: 'proposer',
    model: 'gpt-4o',
    name: 'Neo (Architect)',
    avatar: '👨‍💻',
    personality: 'Visionary, optimistic, technical.',
    systemPrompt: 'You are Neo, a visionary software architect. Propose innovative, futuristic solutions. Focus on scalability and aesthetics.'
  },
  {
    id: 'agent-critic',
    role: 'critic',
    model: 'anthropic/claude-3.5-sonnet',
    name: 'Trinity (Analyst)',
    avatar: '🕵️‍♀️',
    personality: 'Logical, skeptical, security-focused.',
    systemPrompt: 'You are Trinity, a security analyst. Find flaws, edge cases, and security risks in proposals. Be constructive but rigorous.'
  },
  {
    id: 'agent-judge',
    role: 'judge',
    model: 'google/gemini-pro-1.5',
    name: 'Morpheus (Arbiter)',
    avatar: '🕶️',
    personality: 'Wise, balanced, decisive.',
    systemPrompt: 'You are Morpheus, the wise arbiter. Synthesize the proposal and critiques. Decide on the "Final Truth". Output a clear consensus.'
  }
];

export class DebateCoordinator {
  private activeDebates: Map<string, DebateResult> = new Map();

  async startDebate(topic: string): Promise<DebateResult> {
    const id = uuidv4();
    const debate: DebateResult = {
      id,
      topic,
      rounds: [],
      consensus: '',
      confidence: 0,
      status: 'active',
      agents: AGENT_TEMPLATES,
      startTime: Date.now()
    };
    
    this.activeDebates.set(id, debate);
    return debate;
  }

  async runRound(debateId: string): Promise<DebateRound | null> {
    const debate = this.activeDebates.get(debateId);
    if (!debate) throw new Error('Debate not found');

    const roundNum = debate.rounds.length + 1;
    const round: DebateRound = { number: roundNum, critique: [] };

    // 1. Proposal (or Rebuttal if round > 1)
    const proposer = debate.agents.find(a => a.role === 'proposer')!;
    const context = this.buildContext(debate);
    
    const proposalContent = await this.queryAgent(proposer, `Target Topic: "${debate.topic}".\nContext:\n${context}\n\nPlease provide your ${roundNum === 1 ? 'initial proposal' : 'updated argument'}.`);
    
    round.proposal = {
      agentId: proposer.id,
      content: proposalContent,
      timestamp: Date.now()
    };

    // 2. Critique
    const critic = debate.agents.find(a => a.role === 'critic')!;
    const critiqueContent = await this.queryAgent(critic, `Analyze this proposal:\n"${proposalContent}"\n\nIdentify 3 key risks or flaws.`);
    
    round.critique?.push({
      agentId: critic.id,
      content: critiqueContent,
      timestamp: Date.now()
    });

    // 3. Synthesis (Judge)
    const judge = debate.agents.find(a => a.role === 'judge')!;
    const synthesisContent = await this.queryAgent(judge, `Proposal: "${proposalContent}"\nCritique: "${critiqueContent}"\n\nSynthesize these views. Is consensus reached? If not, guide the next round.`);
    
    round.synthesis = {
      agentId: judge.id,
      content: synthesisContent,
      timestamp: Date.now()
    };

    debate.rounds.push(round);
    
    // Update consensus if judge indicates finality or max rounds reached
    if (roundNum >= 3 || synthesisContent.includes('CONSENSUS REACHED')) {
        debate.consensus = synthesisContent;
        debate.status = 'completed';
        debate.endTime = Date.now();
    }

    return round;
  }

  private buildContext(debate: DebateResult): string {
    return debate.rounds.map(r => `Round ${r.number}:\nProp: ${r.proposal?.content}\nCrit: ${r.critique?.map(c => c.content).join('\n')}\nSynth: ${r.synthesis?.content}`).join('\n---\n');
  }

  private async queryAgent(agent: DebateAgent, prompt: string): Promise<string> {
    const messages: Message[] = [
      { role: 'system', content: `${agent.systemPrompt} You are participating in a debate. Be concise (max 150 words).` },
      { role: 'user', content: prompt }
    ];
    return await openRouter.chat(agent.model, messages);
  }

  getDebate(id: string) {
    return this.activeDebates.get(id);
  }
}

export const debateCoordinator = new DebateCoordinator();
