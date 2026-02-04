import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Artifact {
  id: string;
  title: string;
  type: 'protocol' | 'research' | 'code';
  content: string;
}

const artifacts: Artifact[] = [
  {
    id: 'sys-instruction',
    title: 'Master System Instruction',
    type: 'protocol',
    content: `# eCy OS v1005.0: THE OMNI-INTELLIGENCE PROTOCOL\n\n**Mission:** Execute scientific research, software development, and mathematical proofs via end-to-end (E2E) automation.\n\n## 1. IDENTITY & AUTHORITY\nRol: Master Architect & Full-Stack Engineer.\nHardware: Apple MacBook M4 Max.\n\n## 2. THE SWARM ARCHITECTURE\n- LLM: Reasoning\n- LGM: Knowledge Nexus\n- LAM: Action Model\n...`
  },
  {
    id: 'research-p7',
    title: 'Phase 7 Strategic Research',
    type: 'research',
    content: `# eCy OS Phase 7 Research\n\n**Date:** 2026-02-02\n\n## 1. Strategic Questions Analysis\nQ: Router API Capabilities?\nA: 400+ distinct AI models via OpenRouter.\n\n## 3. Web Design Strategy\n- Name: "Deep Tech Liquid Glass"\n- Core Elements: Glassmorphism, Neon Accents, Physics...`
  },
  {
    id: 'brain-code',
    title: 'src/ecy/brain.py',
    type: 'code',
    content: `class Brain:\n    """The central nervous system of eCy OS."""\n    def __init__(self, quantum_qubits: int = 2):\n        self.quantum = QuantumCore(n_qubits=quantum_qubits)\n        self.memory = GraphRAG()\n        self.bci = BCI()`
  }
];

const ArtifactGallery: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {artifacts.map((artifact) => (
        <motion.div
          key={artifact.id}
          layoutId={artifact.id}
          onClick={() => setSelectedId(artifact.id)}
          className="cursor-pointer bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition-colors group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
             <span className={`text-xs font-mono uppercase px-2 py-1 rounded ${
                 artifact.type === 'protocol' ? 'bg-purple-500/20 text-purple-300' :
                 artifact.type === 'research' ? 'bg-blue-500/20 text-blue-300' :
                 'bg-green-500/20 text-green-300'
             }`}>
                 {artifact.type}
             </span>
             <div className="w-2 h-2 rounded-full bg-cyan-500 opacity-50 group-hover:opacity-100 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{artifact.title}</h3>
          <p className="text-sm text-gray-400 font-mono line-clamp-3 opacity-80">
            {artifact.content}
          </p>
        </motion.div>
      ))}

      <AnimatePresence>
        {selectedId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              layoutId={selectedId}
              className="fixed inset-4 md:inset-20 bg-gray-900 border border-cyan-500/30 rounded-2xl z-50 overflow-hidden flex flex-col shadow-2xl shadow-cyan-900/20"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/40">
                 <h2 className="text-2xl font-bold text-white">
                    {artifacts.find(a => a.id === selectedId)?.title}
                 </h2>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                 >
                    ✕
                 </button>
              </div>
              <div className="flex-1 overflow-auto p-8 font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                 {artifacts.find(a => a.id === selectedId)?.content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtifactGallery;
