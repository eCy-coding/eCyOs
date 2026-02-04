// eCy OS v1005.0 - Debate Console UI
// Cyberpunk-themed multi-agent debate interface

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { runDebate } from '../services/debateCoordinator';
import { useDebates, useConsensus, useDebateActions } from '../stores';
import styles from './DebateConsole.module.css';

export function DebateConsole() {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [streamOutput, setStreamOutput] = useState<string[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  const debates = useDebates();
  // const _messages = useDebateMessages(); // Unused for now
  const consensus = useConsensus();
  const { clearMessages } = useDebateActions();

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamOutput]);

  const handleStartDebate = async () => {
    if (!topic.trim() || isDebating) return;

    setIsDebating(true);
    setStreamOutput([]);
    clearMessages();

    try {
      const debateGen = runDebate(topic, {
        maxRounds: 3,
        consensusThreshold: 0.85,
        streamingEnabled: true,
      });

      for await (const update of debateGen) {
        setStreamOutput(prev => [...prev, update]);
      }
    } catch (error) {
      console.error('[Debate] Error:', error);
      setStreamOutput(prev => [...prev, `\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`]);
    } finally {
      setIsDebating(false);
    }
  };

  const handleExampleClick = (exampleTopic: string) => {
    setTopic(exampleTopic);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🎭</span>
          The Council of Wisdom
        </h2>
        <p className={styles.subtitle}>Multi-Agent Consensus Debates (400+ AI Models)</p>
      </div>

      {/* Input Section */}
      <div className={styles.inputSection}>
        <input
          type="text"
          className={styles.input}
          placeholder="Ask a question for the council to debate..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStartDebate()}
          disabled={isDebating}
        />
        <button
          className={styles.startButton}
          onClick={handleStartDebate}
          disabled={isDebating || !topic.trim()}
        >
          {isDebating ? '⏳ Debating...' : '🚀 Start Debate'}
        </button>
      </div>

      {/* Output Console */}
      <div className={styles.output} ref={outputRef}>
        {streamOutput.length === 0 ? (
          <div className={styles.placeholder}>
            <p>No active debates. Ask a question above to begin.</p>
            <div className={styles.examples}>
              <p><strong>Example questions:</strong></p>
              <ul>
                <li onClick={() => handleExampleClick('What is the square root of 256?')}>
                  What is the square root of 256?
                </li>
                <li onClick={() => handleExampleClick('How do black holes affect time?')}>
                  How do black holes affect time?
                </li>
                <li onClick={() => handleExampleClick("What's the best sorting algorithm for large datasets?")}>
                  What's the best sorting algorithm for large datasets?
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className={styles.stream}>
            {streamOutput.map((line, idx) => (
              <div key={idx} className={styles.line}>
                {formatLine(line)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {consensus && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Final Answer:</span>
            <span className={styles.statValue}>{consensus.finalAnswer}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Confidence:</span>
            <span className={styles.statValue}>{(consensus.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Rounds:</span>
            <span className={styles.statValue}>{consensus.rounds}</span>
          </div>
        </div>
      )}

      {/* Debate History Sidebar */}
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Recent Debates</h3>
        {debates.length === 0 ? (
          <p className={styles.sidebarEmpty}>No debates yet</p>
        ) : (
          <ul className={styles.debateList}>
            {debates.slice(0, 5).map((debate) => (
              <li key={debate.id} className={styles.debateItem}>
                <div className={styles.debateTopic}>{debate.topic}</div>
                <div className={styles.debateStatus}>
                  {debate.status === 'consensus_reached' ? '✅' : '⏳'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Helper: Format markdown-style output
function formatLine(line: string): React.JSX.Element {
  // Bold: **text**
  if (line.includes('**')) {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  }
  return <span>{line}</span>;
}
