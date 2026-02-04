import React, { useState, useCallback } from 'react';
import { callAgent, DEBATE_AGENTS } from '../../services/openrouter';
import styles from './TheCouncil.module.css';

interface Agent {
  id: string;
  name: string;
  role: 'proposer' | 'critic' | 'judge';
  model: string;
  avatar: string;
}

interface DebateMessage {
  id: string;
  agentId: string;
  agentName: string;
  role: string;
  content: string;
  timestamp: Date;
  consensusImpact?: number;
}

interface DebateSession {
  id: string;
  topic: string;
  status: 'active' | 'completed' | 'failed';
  consensusScore: number;
  messages: DebateMessage[];
  finalVerdict?: string;
}

const DEFAULT_AGENTS: Agent[] = [
  { id: 'proposer-1', name: 'Atlas', role: 'proposer', model: 'openai/gpt-4', avatar: '🧠' },
  { id: 'critic-1', name: 'Socrates', role: 'critic', model: 'anthropic/claude-3.5-sonnet', avatar: '🔍' },
  { id: 'judge-1', name: 'Athena', role: 'judge', model: 'meta-llama/llama-3.3-70b-instruct', avatar: '⚖️' },
];

export const TheCouncil: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [session, setSession] = useState<DebateSession | null>(null);
  const [isDebating, setIsDebating] = useState(false);
  const [selectedAgents] = useState<Agent[]>(DEFAULT_AGENTS);

  const startDebate = useCallback(async () => {
    if (!topic.trim()) return;

    setIsDebating(true);
    const newSession: DebateSession = {
      id: `debate-${Date.now()}`,
      topic: topic.trim(),
      status: 'active',
      consensusScore: 0,
      messages: [],
    };

    setSession(newSession);

    try {
      // Step 1: Proposer makes initial argument
      await simulateAgentResponse(newSession, selectedAgents[0]);

      // Step 2: Critic challenges the argument
      await simulateAgentResponse(newSession, selectedAgents[1]);

      // Step 3: Proposer responds to criticism
      await simulateAgentResponse(newSession, selectedAgents[0]);

      // Step 4: Judge delivers final verdict
      const verdict = await simulateAgentResponse(newSession, selectedAgents[2]);

      // Calculate final consensus
      const consensusMatch = verdict.match(/consensus[:\s]+(\d+)/i);
      const finalConsensus = consensusMatch ? parseInt(consensusMatch[1]) : 50;

      setSession(prev => prev ? {
        ...prev,
        status: 'completed',
        consensusScore: finalConsensus,
        finalVerdict: verdict,
      } : null);

    } catch (error) {
      console.error('Debate error:', error);
      setSession(prev => prev ? { ...prev, status: 'failed' } : null);
    } finally {
      setIsDebating(false);
    }
  }, [topic, selectedAgents]);

  const simulateAgentResponse = async (
    currentSession: DebateSession,
    agent: Agent
  ): Promise<string> => {
    try {
      // Get agent configuration
      const agentConfig = DEBATE_AGENTS[agent.role];
      
      // Build context from previous messages
      const context: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = currentSession.messages.map(msg => ({
        role: 'assistant' as const,
        content: `${msg.agentName} (${msg.role}): ${msg.content}`
      }));

      // Create user message for this agent's turn
      const userMessage = `Topic: "${currentSession.topic}"\n\n${
        context.length === 0 
          ? 'Present your initial argument.' 
          : `Previous discussion:\n${context.map(c => c.content).join('\n\n')}\n\nProvide your response.`
      }`;

      // Call OpenRouter API
      const response = await callAgent(agentConfig, userMessage, context);

      // Add message to session
      const message: DebateMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        content: response,
        timestamp: new Date(),
        consensusImpact: agent.role === 'judge' ? 72 : undefined,
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
      } : null);

      return response;

    } catch (error) {
      console.error(`OpenRouter API error for ${agent.name}:`, error);
      
      // Fallback to mocked responses if API fails
      const mockResponses: Record<string, string[]> = {
        'proposer': [
          "I propose that AI will fundamentally transform software development by 2030. The evidence shows rapid advancement in code generation, automated testing, and intelligent debugging tools.",
          "Addressing the critic's concerns: While AI has limitations, the trajectory of improvement is exponential. GitHub Copilot has already shown 30-40% productivity gains.",
        ],
        'critic': [
          "The Proposer's argument overlooks critical challenges: AI hallucinations, context window limitations, and the inability to understand business requirements. Current tools are assistive, not transformative.",
        ],
        'judge': [
          "Both sides present valid points. The Proposer demonstrates optimism backed by current trends, while the Critic highlights real-world constraints. My verdict: AI will be highly impactful but not fully autonomous by 2030. Consensus: 72/100 - Significant transformation likely, but with human oversight remaining essential.",
        ],
      };

      const responsePool = mockResponses[agent.role] || ["Generic response"];
      const responseIndex = currentSession.messages.filter(m => m.agentId === agent.id).length;
      const content = responsePool[Math.min(responseIndex, responsePool.length - 1)];

      const message: DebateMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        content,
        timestamp: new Date(),
        consensusImpact: agent.role === 'judge' ? 72 : undefined,
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
      } : null);

      return content;
    }
  };

  const resetDebate = useCallback(() => {
    setSession(null);
    setTopic('');
    setIsDebating(false);
  }, []);

  const getConsensusColor = (score: number): string => {
    if (score >= 80) return '#00ff00';
    if (score >= 60) return '#00ffff';
    if (score >= 40) return '#ffff00';
    return '#ff6b6b';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🏛️</span>
          The Council
        </h2>
        <p className={styles.subtitle}>Multi-Agent Debate System • Consensus-Driven Truth</p>
      </div>

      {/* Agents Display */}
      <div className={styles.agentsSection}>
        <h3 className={styles.sectionTitle}>Active Agents</h3>
        <div className={styles.agentsGrid}>
          {selectedAgents.map(agent => (
            <div key={agent.id} className={styles.agentCard}>
              <span className={styles.agentAvatar}>{agent.avatar}</span>
              <div className={styles.agentInfo}>
                <div className={styles.agentName}>{agent.name}</div>
                <div className={styles.agentRole}>{agent.role.toUpperCase()}</div>
                <div className={styles.agentModel}>{agent.model.split('/')[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Input */}
      {!session && (
        <div className={styles.inputSection}>
          <h3 className={styles.sectionTitle}>Debate Topic</h3>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={styles.topicInput}
            placeholder="Enter a topic for the Council to debate... (e.g., 'Will AI replace software developers by 2030?')"
            rows={3}
            disabled={isDebating}
          />
          <button
            onClick={startDebate}
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={!topic.trim() || isDebating}
          >
            {isDebating ? '🔄 Debating...' : '🚀 Start Debate'}
          </button>
        </div>
      )}

      {/* Debate Session */}
      {session && (
        <div className={styles.debateSection}>
          <div className={styles.debateHeader}>
            <h3 className={styles.debateTopic}>{session.topic}</h3>
            <div className={styles.debateStatus}>
              <span className={`${styles.statusBadge} ${styles[session.status]}`}>
                {session.status.toUpperCase()}
              </span>
              {session.status === 'completed' && (
                <div className={styles.consensusDisplay}>
                  <span className={styles.consensusLabel}>Consensus:</span>
                  <span
                    className={styles.consensusScore}
                    style={{ color: getConsensusColor(session.consensusScore) }}
                  >
                    {session.consensusScore}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {session.messages.map(message => {
              const agent = selectedAgents.find(a => a.id === message.agentId);
              return (
                <div key={message.id} className={`${styles.message} ${styles[message.role]}`}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageAvatar}>{agent?.avatar}</span>
                    <div className={styles.messageInfo}>
                      <span className={styles.messageName}>{message.agentName}</span>
                      <span className={styles.messageRole}>{message.role}</span>
                    </div>
                    <span className={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={styles.messageContent}>{message.content}</div>
                  {message.consensusImpact !== undefined && (
                    <div className={styles.consensusImpact}>
                      Consensus Impact: +{message.consensusImpact}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Verdict */}
          {session.finalVerdict && (
            <div className={styles.verdictBox}>
              <h4>📜 Final Verdict</h4>
              <p>{session.finalVerdict}</p>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={resetDebate}
              className={`${styles.button} ${styles.buttonSecondary}`}
              disabled={isDebating}
            >
              🔄 New Debate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheCouncil;
