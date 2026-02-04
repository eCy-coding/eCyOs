import React from 'react';
import { motion } from 'framer-motion';

interface ConsensusDisplayProps {
  consensus: string;
}

const ConsensusDisplay: React.FC<ConsensusDisplayProps> = ({ consensus }) => {
  if (!consensus) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 rounded-xl border border-purple-500/30 bg-purple-900/10 backdrop-blur-xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <h3 className="text-xl font-orbitron text-purple-300 mb-4 flex items-center">
        <span className="mr-2 text-2xl">⚡</span> 
        FINAL CONSENSUS REACHED
      </h3>
      
      <div className="prose prose-invert max-w-none font-sans text-gray-200 leading-relaxed">
        {consensus.split('\n').map((line, i) => (
          <p key={i} className="mb-2">{line}</p>
        ))}
      </div>
      
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 w-full" />
    </motion.div>
  );
};

export default ConsensusDisplay;
