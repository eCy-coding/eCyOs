/* src/stage/renderer/src/components/BrainDashboard.tsx */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Mock data types for the dashboard
interface BrainState {
  quantumStatus: 'online' | 'offline';
  memoryNodes: number;
  bciSignalStrength: number;
}

const BrainDashboard: React.FC = () => {
  const [brainState, setBrainState] = useState<BrainState>({
    quantumStatus: 'online',
    memoryNodes: 1024,
    bciSignalStrength: 85,
  });

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBrainState(prev => ({
        ...prev,
        memoryNodes: prev.memoryNodes + Math.floor(Math.random() * 5),
        bciSignalStrength: Math.max(0, Math.min(100, prev.bciSignalStrength + (Math.random() * 10 - 5))),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="brain-dashboard p-6 bg-black/80 text-cyan-400 font-mono rounded-xl border border-cyan-900 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
      <header className="mb-6 border-b border-cyan-800 pb-2 flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          eCy OS BRAIN INTERFACE
        </h2>
        <span className="text-xs text-cyan-600 animate-pulse">● LIVE CONNECTION</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Quantum Intelligence */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="quantum-module bg-gray-900/50 p-4 rounded-lg border border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-2 text-purple-400">Quantum Cortex</h3>
          <div className="status flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${brainState.quantumStatus === 'online' ? 'bg-green-500 shadow-[0_0_10px_#0f0]' : 'bg-red-500'}`} />
            <span className="uppercase text-sm">{brainState.quantumStatus}</span>
          </div>
          <div className="visualizer h-24 bg-black rounded flex items-center justify-center text-xs text-gray-500">
            [3D BLOCH SPHERE VIEW]
          </div>
        </motion.div>

        {/* Module 2: Advanced Memory (LGM) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="memory-module bg-gray-900/50 p-4 rounded-lg border border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Graph Memory</h3>
          <div className="stats text-sm mb-4">
            <p>Active Nodes: <span className="text-white font-bold">{brainState.memoryNodes}</span></p>
          </div>
          <div className="visualizer h-24 bg-black rounded flex items-center justify-center text-xs text-gray-500">
            [KNOWLEDGE GRAPH VISUALIZATION]
          </div>
        </motion.div>

        {/* Module 3: Bio-Digital Interface (BCI) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bci-module bg-gray-900/50 p-4 rounded-lg border border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-2 text-green-400">Bio-Link</h3>
          <div className="stats text-sm mb-4">
            <p>Signal Integrity: <span className="text-white font-bold">{Math.round(brainState.bciSignalStrength)}%</span></p>
            <div className="w-full bg-gray-800 h-2 mt-1 rounded overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${brainState.bciSignalStrength}%` }}
              />
            </div>
          </div>
          <div className="visualizer h-24 bg-black rounded flex items-center justify-center text-xs text-gray-500">
            [REAL-TIME EEG WAVEFORM]
          </div>
        </motion.div>
      </div>
      
      <footer className="mt-6 pt-2 border-t border-cyan-900 text-xs text-center text-cyan-700">
        SYSTEM INTEGRITY: 100% | MODE: OMNI-INTELLIGENCE
      </footer>
    </div>
  );
};

export default BrainDashboard;
