import React, { useState } from 'react';
import { debateCoordinator } from '../agents/DebateCoordinator';
import type { DebateResult } from '../agents/types';
import DebateVisualization from '../components/debate/DebateVisualization';
import ConsensusDisplay from '../components/debate/ConsensusDisplay';
import AgentAvatar from '../components/debate/AgentAvatar';
import { motion } from 'framer-motion';

const DebateConsolePage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [debateState, setDebateState] = useState<DebateResult | null>(null);

  const startDebate = async () => {
    if (!topic.trim()) return;

    setIsDebating(true);
    const debate = await debateCoordinator.startDebate(topic);
    setDebateState({ ...debate });

    // Run 3 rounds automatically for this demo
    try {
        for (let i = 0; i < 3; i++) {
            await debateCoordinator.runRound(debate.id);
            setDebateState({ ...debateCoordinator.getDebate(debate.id)! }); // Force update from source
            
            // Check for early consensus
            const currentDebate = debateCoordinator.getDebate(debate.id)!;
            if (currentDebate.status === 'completed') break;
        }
    } catch (error) {
        console.error("Debate Error:", error);
    } finally {
        setIsDebating(false);
    }
  };

  return (
    <div className="h-screen pt-20 pb-10 px-8 flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            THE COUNCIL
          </h1>
          <p className="text-gray-400 mt-2 font-light">Multi-Agent Consensus System v1.0</p>
        </div>
        
        {/* Active Agents Display */}
        <div className="flex space-x-6">
          {debateState?.agents.map(agent => (
            <AgentAvatar key={agent.id} agent={agent} isActive={false} /> // In a real app, isActive would track current speaker
          ))}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left: Input & Controls */}
        <div className="w-1/3 flex flex-col space-y-6">
          <div className="glass-panel p-6 flex flex-col h-full">
            <h2 className="text-lg font-orbitron text-cyan-400 mb-4">Initialize Session</h2>
            
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500 outline-none resize-none transition-allCustom"
              rows={6}
              placeholder="Enter a complex topic for The Council to debate..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isDebating}
            />

            <button
              onClick={startDebate}
              disabled={isDebating || !topic}
              className={`mt-6 py-4 rounded-xl font-bold tracking-widest uppercase transition-all
                ${isDebating 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:scale-[1.02] shadow-lg shadow-cyan-500/20 text-white'}
              `}
            >
              {isDebating ? 'Processing Logic...' : 'Convene Council'}
            </button>

            <div className="mt-8 text-xs text-gray-500 font-mono space-y-2">
              <p>ACCESSING: OpenRouter Neural Fabric</p>
              <p>MODELS: GPT-4o, Claude-3.5, Gemini-1.5</p>
              <p>LATENCY: 45ms</p>
              <p>PROTOCOL: MIT-2000-Consensus</p>
            </div>
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="w-2/3 flex flex-col">
          <div className="glass-panel flex-1 p-6 relative overflow-hidden flex flex-col">
            {debateState ? (
              <>
                <DebateVisualization 
                  rounds={debateState.rounds} 
                  agents={debateState.agents}
                  isThinking={isDebating}
                />
                
                <ConsensusDisplay consensus={debateState.consensus} />
              </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm animate-pulse">
                    AWAITING TOPIC INJECTION...
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DebateConsolePage;
