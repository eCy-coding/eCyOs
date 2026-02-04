import React, { useEffect, useRef } from 'react';
import type { DebateRound, DebateAgent } from '../../agents/types';
import AgentAvatar from './AgentAvatar';
import { motion } from 'framer-motion';

interface DebateVisualizationProps {
  rounds: DebateRound[];
  agents: DebateAgent[];
  isThinking: boolean;
}

const DebateVisualization: React.FC<DebateVisualizationProps> = ({ rounds, agents, isThinking }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rounds, isThinking]);

  const getAgent = (role: string) => agents.find(a => a.role === role)!;

  return (
    <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar min-h-[400px]">
      {rounds.map((round) => (
        <div key={round.number} className="space-y-4">
          <div className="flex items-center justify-center my-8">
            <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
              ROUND {round.number}
            </span>
          </div>

          {/* Proposal */}
          {round.proposal && (
            <MessageBlock 
              agent={getAgent('proposer')} 
              content={round.proposal.content} 
              type="proposal" 
            />
          )}

          {/* Critique */}
          {round.critique?.map((crit, idx) => (
            <MessageBlock 
              key={idx}
              agent={getAgent('critic')} 
              content={crit.content} 
              type="critique" 
            />
          ))}

          {/* Synthesis */}
          {round.synthesis && (
            <MessageBlock 
              agent={getAgent('judge')} 
              content={round.synthesis.content} 
              type="synthesis" 
            />
          )}
        </div>
      ))}

      {isThinking && (
        <div className="flex items-center space-x-3 animate-pulse text-cyan-400 font-mono text-sm py-4">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150" />
          <span>The Council is deliberating...</span>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

const MessageBlock = ({ agent, content, type }: { agent: DebateAgent, content: string, type: string }) => {
  const borderColors: Record<string, string> = {
    proposal: 'border-l-cyan-500/50',
    critique: 'border-l-red-500/50',
    synthesis: 'border-l-purple-500/50'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex space-x-4 pl-4 border-l-2 ${borderColors[type]} bg-white/5 p-4 rounded-r-xl`}
    >
      <div className="shrink-0 mt-1">
        <AgentAvatar agent={agent} isActive={false} />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">{type}</div>
        <p className="text-sm font-light leading-relaxed text-gray-200 whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  );
};

export default DebateVisualization;
