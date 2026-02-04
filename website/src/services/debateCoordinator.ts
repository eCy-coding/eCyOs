// eCy OS v1005.0 - Debate Coordinator
// Multi-agent consensus orchestration

import { callAgent, streamAgent, DEBATE_AGENTS, type Message } from './openrouter';
import { useAppStore } from '../stores';

export interface DebateConfig {
  maxRounds: number;
  consensusThreshold: number;
  streamingEnabled: boolean;
}

export interface DebateResult {
  consensusReached: boolean;
  finalAnswer: string;
  confidence: number;
  rounds: number;
  totalCost: number;
  modelVotes: Record<string, number>;
}

const DEFAULT_CONFIG: DebateConfig = {
  maxRounds: 5,
  consensusThreshold: 0.85,
  streamingEnabled: true,
};

// Cost estimation (per 1M tokens)
const MODEL_COSTS = {
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'anthropic/claude-3.5-sonnet': { input: 3, output: 15 },
  'google/gemini-2.0-flash-exp:free': { input: 0, output: 0 }, // Free tier
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const cost = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || { input: 0, output: 0 };
  return ((inputTokens * cost.input) + (outputTokens * cost.output)) / 1_000_000;
}

// Main debate orchestrator (async generator for streaming)
export async function* runDebate(
  topic: string,
  config: DebateConfig = DEFAULT_CONFIG
): AsyncGenerator<string, DebateResult> {
  const store = useAppStore.getState();
  const debateId = store.createDebate(topic);
  
  let rounds = 0;
  const context: Message[] = [];
  let totalCost = 0;
  const votes: Record<string, number> = {};

  store.setStreaming(true);

  while (rounds < config.maxRounds) {
    rounds++;
    yield `\n**[Round ${rounds}]**\n`;

    // ===============================
    // PROPOSER'S TURN
    // ===============================
    yield `\n🔵 **Proposer** (GPT-4o Mini) is thinking...\n`;
    
    let proposalText = '';
    const proposalChunks: string[] = [];
    
    if (config.streamingEnabled) {
      for await (const chunk of streamAgent(DEBATE_AGENTS.proposer, topic, context)) {
        proposalChunks.push(chunk);
        yield chunk;
      }
      proposalText = proposalChunks.join('');
    } else {
      proposalText = await callAgent(DEBATE_AGENTS.proposer, topic, context);
      yield proposalText;
    }

    // Save to store
    store.addMessage({
      debateId,
      agentRole: 'proposer',
      modelUsed: DEBATE_AGENTS.proposer.model,
      content: proposalText,
      confidenceScore: extractConfidence(proposalText),
    });

    context.push({ role: 'assistant', content: `Proposer: ${proposalText}` });
    totalCost += estimateCost(DEBATE_AGENTS.proposer.model, 200, 400);
    yield `\n`;

    // ===============================
    // CRITIC'S TURN
    // ===============================
    yield `\n🟠 **Critic** (Claude 3.5) is analyzing...\n`;
    
    let critiqueText = '';
    const critiqueChunks: string[] = [];
    
    if (config.streamingEnabled) {
      for await (const chunk of streamAgent(
        DEBATE_AGENTS.critic,
        `Analyze this proposed answer: "${proposalText}"`,
        context
      )) {
        critiqueChunks.push(chunk);
        yield chunk;
      }
      critiqueText = critiqueChunks.join('');
    } else {
      critiqueText = await callAgent(
        DEBATE_AGENTS.critic,
        `Analyze this proposed answer: "${proposalText}"`,
        context
      );
      yield critiqueText;
    }

    store.addMessage({
      debateId,
      agentRole: 'critic',
      modelUsed: DEBATE_AGENTS.critic.model,
      content: critiqueText,
      confidenceScore: extractConfidence(critiqueText),
    });

    context.push({ role: 'assistant', content: `Critic: ${critiqueText}` });
    totalCost += estimateCost(DEBATE_AGENTS.critic.model, 250, 400);
    yield `\n`;

    // ===============================
    // JUDGE'S TURN
    // ===============================
    yield `\n🟢 **Judge** (Gemini 2.0) is deliberating...\n`;
    
    const judgmentText = await callAgent(
      DEBATE_AGENTS.judge,
      `Based on this discussion, determine consensus:\n\nProposer: ${proposalText}\n\nCritic: ${critiqueText}\n\nFormat: CONSENSUS: <yes/no> | ANSWER: <solution> | CONFIDENCE: <0-1>`,
      context
    );
    
    yield judgmentText;
    yield `\n`;

    store.addMessage({
      debateId,
      agentRole: 'judge',
      modelUsed: DEBATE_AGENTS.judge.model,
      content: judgmentText,
      confidenceScore: extractConfidence(judgmentText),
    });

    // Parse judge's decision
    const consensusMatch = judgmentText.match(/CONSENSUS:\s*(yes|no)/i);
    const answerMatch = judgmentText.match(/ANSWER:\s*(.+?)(?:\||$)/i);
    const confidenceMatch = judgmentText.match(/CONFIDENCE:\s*([0-9.]+)/i);

    const consensusReached = consensusMatch?.[1]?.toLowerCase() === 'yes';
    const finalAnswer = answerMatch?.[1]?.trim() || 'No answer provided';
    const confidence = parseFloat(confidenceMatch?.[1] || '0');

    context.push({ role: 'assistant', content: `Judge: ${judgmentText}` });
    votes[DEBATE_AGENTS.judge.model] = confidence;

    // Check if consensus reached
    if (consensusReached && confidence >= config.consensusThreshold) {
      const consensusResult = {
        finalAnswer,
        confidence,
        rounds,
        modelVotes: votes,
      };

      store.setConsensus(consensusResult);
      store.setStreaming(false);

      yield `\n✅ **CONSENSUS REACHED!**\n`;
      yield `**Answer:** ${finalAnswer}\n`;
      yield `**Confidence:** ${(confidence * 100).toFixed(1)}%\n`;
      yield `**Rounds:** ${rounds}\n`;
      yield `**Estimated Cost:** $${totalCost.toFixed(4)}\n`;

      return {
        consensusReached: true,
        finalAnswer,
        confidence,
        rounds,
        totalCost,
        modelVotes: votes,
      };
    }

    yield `\n⏭️ Consensus not reached (confidence: ${(confidence * 100).toFixed(1)}%). Continuing to next round...\n`;
  }

  // No consensus after max rounds
  store.setStreaming(false);
  store.closeDebate(debateId);

  yield `\n⏱️ **TIMEOUT**: No consensus after ${config.maxRounds} rounds\n`;
  yield `**Estimated Cost:** $${totalCost.toFixed(4)}\n`;

  return {
    consensusReached: false,
    finalAnswer: 'No consensus reached',
    confidence: 0,
    rounds: config.maxRounds,
    totalCost,
    modelVotes: votes,
  };
}

// Helper: Extract confidence score from agent response
function extractConfidence(text: string): number {
  const match = text.match(/confidence[:\s]+([0-9.]+)/i);
  return match ? parseFloat(match[1]) : 0.5;
}
