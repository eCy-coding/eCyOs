/**
 * Debate Coordinator
 * Orchestrates multi-agent debates using Centralized Supervisor pattern
 */

import { openRouter } from '../openrouter';
import type { Message } from '../openrouter';
import type {
  AgentRole,
  AgentModels,
  AgentResponse,
  Round,
  Consensus,
  DebateSession,
  DebateConfig
} from './types';
import { DEFAULT_DEBATE_CONFIG } from './types';

export class DebateCoordinator {
  private config: Required<DebateConfig>;

  constructor(config: DebateConfig = {}) {
    this.config = { ...DEFAULT_DEBATE_CONFIG, ...config };
  }

  /**
   * Start a new debate session
   * @param topic - The debate topic/question
   * @param models - Agent model configuration
   * @param supabase - Optional Supabase client for persistence
   */
  async startDebate(
    topic: string,
    models: AgentModels
  ): Promise<DebateSession> {
    const session: DebateSession = {
      id: crypto.randomUUID(),
      topic,
      rounds: [],
      status: 'ACTIVE',
      models,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('[DebateCoordinator] Starting debate:', {
      id: session.id,
      topic,
      models
    });

    try {
      // Run debate rounds
      for (let roundNum = 1; roundNum <= this.config.maxRounds; roundNum++) {
        console.log(`[DebateCoordinator] Round ${roundNum}/${this.config.maxRounds}`);
        
        const round = await this.runRound(session, roundNum);
        session.rounds.push(round);
        session.updatedAt = new Date();

        // Check for consensus after round 3
        if (roundNum >= 3) {
          const consensus = await this.checkConsensus(session);
          if (consensus) {
            session.status = 'CONSENSUS';
            session.consensus = consensus;
            console.log('[DebateCoordinator] Consensus reached:', consensus);
            break;
          }
        }
      }

      // Force consensus if max rounds reached
      if (!session.consensus) {
        console.log('[DebateCoordinator] Max rounds reached, forcing consensus');
        session.status = 'MAX_ROUNDS_REACHED';
        session.consensus = await this.forceConsensus(session);
      }

      return session;
    } catch (error) {
      console.error('[DebateCoordinator] Debate failed:', error);
      session.status = 'FAILED';
      throw error;
    }
  }

  /**
   * Execute one debate round
   * @private
   */
  private async runRound(
    session: DebateSession,
    roundNumber: number
  ): Promise<Round> {
    const round: Round = {
      number: roundNumber,
      responses: []
    };

    // Round 1: Proposer presents initial argument
    if (roundNumber === 1) {
      const response = await this.callAgent(
        'proposer',
        session.models.proposer,
        this.buildProposerPrompt(session.topic)
      );
      round.responses.push(response);
      return round;
    }

    // Round 2: Critic challenges the proposal
    if (roundNumber === 2) {
      const lastProposal = session.rounds[0].responses[0].content;
      const response = await this.callAgent(
        'critic',
        session.models.critic,
        this.buildCriticPrompt(session.topic, lastProposal)
      );
      round.responses.push(response);
      return round;
    }

    // Round 3+: Alternating refinements
    if (roundNumber % 2 === 1) {
      // Odd rounds: Proposer refines
      const lastCritique = session.rounds[roundNumber - 2].responses[0].content;
      const response = await this.callAgent(
        'proposer',
        session.models.proposer,
        this.buildRefinementPrompt(session.topic, lastCritique)
      );
      round.responses.push(response);
    } else {
      // Even rounds: Critic responds
      const lastProposal = session.rounds[roundNumber - 2].responses[0].content;
      const response = await this.callAgent(
        'critic',
        session.models.critic,
        this.buildCriticPrompt(session.topic, lastProposal, true)
      );
      round.responses.push(response);
    }

    return round;
  }

  /**
   * Call an AI agent via OpenRouter
   * @private
   */
  private async callAgent(
    role: AgentRole,
    model: string,
    prompt: string
  ): Promise<AgentResponse> {
    const systemPrompts: Record<AgentRole, string> = {
      proposer: 'You are a skilled debater who presents strong, evidence-based arguments. Be thorough but concise.',
      critic: 'You are a critical thinker who challenges assumptions and finds flaws in reasoning. Be constructive and precise.',
      judge: 'You are an impartial judge who evaluates both sides objectively to determine truth. Be fair and analytical.',
      synthesizer: 'You synthesize diverse perspectives into a unified, accurate conclusion. Be comprehensive yet clear.'
    };

    const messages: Message[] = [
      { role: 'system', content: systemPrompts[role] },
      { role: 'user', content: prompt }
    ];

    console.log(`[DebateCoordinator] Calling ${role} (${model})`);

    try {
      const content = await openRouter.chat(model, messages);
      
      return {
        agent: role,
        model,
        content,
        confidence: this.estimateConfidence(content),
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`[DebateCoordinator] Agent call failed:`, error);
      throw new Error(`Failed to call ${role}: ${error}`);
    }
  }

  /**
   * Check if consensus has been reached
   * @private
   */
  private async checkConsensus(
    session: DebateSession
  ): Promise<Consensus | null> {
    if (session.rounds.length < 3) return null;

    // Call judge to evaluate the debate
    const debateSummary = this.buildDebateSummary(session);
    const judgeResponse = await this.callAgent(
      'judge',
      session.models.judge,
      this.buildJudgePrompt(session.topic, debateSummary)
    );

    // Parse judge's verdict
    const verdict = this.parseJudgeVerdict(judgeResponse.content);
    
    if (verdict.hasConsensus && verdict.confidence >= this.config.consensusThreshold) {
      return {
        verdict: 'MAJORITY',
        confidence: verdict.confidence,
        finalAnswer: verdict.answer,
        evidence: session.rounds.flatMap(r => r.responses.map(res => res.content)),
        reasoning: judgeResponse.content
      };
    }

    return null;
  }

  /**
   * Force consensus after max rounds by synthesizing all arguments
   * @private
   */
  private async forceConsensus(session: DebateSession): Promise<Consensus> {
    const debateSummary = this.buildDebateSummary(session);
    const synthesizerResponse = await this.callAgent(
      'synthesizer',
      session.models.synthesizer,
      this.buildSynthesizerPrompt(session.topic, debateSummary)
    );

    return {
      verdict: 'FORCED',
      confidence: 0.6,
      finalAnswer: synthesizerResponse.content,
      evidence: session.rounds.flatMap(r => r.responses.map(res => res.content)),
      reasoning: 'Max rounds reached, synthesized final answer'
    };
  }

  // === Prompt Builders ===

  private buildProposerPrompt(topic: string): string {
    return `Present a clear, well-reasoned argument for the following topic:\n\n"${topic}"\n\nProvide evidence and logical reasoning to support your position. Be concise but thorough.`;
  }

  private buildCriticPrompt(topic: string, proposal: string, isRefinement = false): string {
    const prefix = isRefinement ? 'Continue to critique' : 'Critically analyze';
    return `${prefix} this argument about "${topic}":\n\n${proposal}\n\nIdentify weaknesses, logical fallacies, missing evidence, or alternative perspectives. Be constructive.`;
  }

  private buildRefinementPrompt(topic: string, critique: string): string {
    return `Refine your argument about "${topic}" based on this critique:\n\n${critique}\n\nAddress the weaknesses raised and strengthen your position with additional evidence or reasoning.`;
  }

  private buildJudgePrompt(topic: string, debateSummary: string): string {
    return `As an impartial judge, evaluate this debate about "${topic}":\n\n${debateSummary}\n\nDetermine:\n1. Has a clear consensus emerged?\n2. What is the most accurate answer based on the evidence?\n3. Confidence level (0-1)\n\nFormat: [CONSENSUS: yes/no] [CONFIDENCE: 0.XX] [ANSWER: your verdict]`;
  }

  private buildSynthesizerPrompt(topic: string, debateSummary: string): string {
    return `Synthesize the following debate about "${topic}" into a final, balanced answer:\n\n${debateSummary}\n\nProvide a comprehensive conclusion that incorporates valid points from all perspectives.`;
  }

  private buildDebateSummary(session: DebateSession): string {
    return session.rounds
      .map((round, idx) => {
        const responses = round.responses
          .map(r => `[${r.agent.toUpperCase()}]: ${r.content}`)
          .join('\n\n');
        return `=== Round ${idx + 1} ===\n${responses}`;
      })
      .join('\n\n');
  }

  // === Helper Methods ===

  private estimateConfidence(content: string): number {
    // Simple heuristic: longer, more detailed responses = higher confidence
    const wordCount = content.split(/\s+/).length;
    const hasEvidence = /evidence|study|research|data|fact/i.test(content);
    const hasHedging = /maybe|perhaps|possibly|might|could/i.test(content);
    
    let confidence = 0.7;
    if (wordCount > 200) confidence += 0.1;
    if (hasEvidence) confidence += 0.1;
    if (hasHedging) confidence -= 0.1;
    
    return Math.max(0.5, Math.min(1.0, confidence));
  }

  private parseJudgeVerdict(content: string): {
    hasConsensus: boolean;
    confidence: number;
    answer: string;
  } {
    const consensusMatch = content.match(/\[CONSENSUS:\s*(yes|no)\]/i);
    const confidenceMatch = content.match(/\[CONFIDENCE:\s*(0?\.\d+|1\.0)\]/i);
    const answerMatch = content.match(/\[ANSWER:\s*(.+?)\]/is);

    return {
      hasConsensus: (consensusMatch?.[1]?.toLowerCase() === 'yes') || false,
      confidence: parseFloat(confidenceMatch?.[1] || '0.7'),
      answer: answerMatch?.[1]?.trim() || content
    };
  }
}
