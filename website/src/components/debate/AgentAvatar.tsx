import React from 'react';
import type { DebateAgent } from '../../agents/types';

interface AgentAvatarProps {
  agent: DebateAgent;
  isActive: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  proposer: 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]',
  critic: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  judge: 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
  analyst: 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
};

const AgentAvatar: React.FC<AgentAvatarProps> = ({ agent, isActive }) => {
  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-70 scale-95'}`}>
      <div className={`
        w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl bg-black/40 backdrop-blur-md
        transition-all duration-500
        ${isActive ? ROLE_COLORS[agent.role] : 'border-white/10'}
        ${isActive ? 'animate-pulse' : ''}
      `}>
        {agent.avatar}
      </div>
      <span className={`mt-2 text-xs font-mono uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
        {agent.name}
      </span>
      <span className="text-[10px] text-gray-500 capitalize">{agent.model.split('/')[1] || agent.model}</span>
    </div>
  );
};

export default AgentAvatar;
