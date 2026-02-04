
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlass } from '../theme/LiquidGlass';
import { Sparkles, Brain } from 'lucide-react';

interface MonacoGhostProps {
  visible: boolean;
  thought?: string;
  ghostText?: string;
  position?: { top: number; left: number };
}

export const MonacoGhost: React.FC<MonacoGhostProps> = ({ 
  visible, 
  thought, 
  ghostText, 
  position = { top: 20, left: 20 } 
}) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <AnimatePresence>
        {/* 1. Thought Bubble (floating) */}
        {thought && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute max-w-md p-3 rounded-xl backdrop-blur-md border border-cyan-500/30 flex gap-3 items-start shadow-lg"
            style={{ 
              top: position.top, 
              right: 20, // Align to right side
              background: "rgba(0, 0, 0, 0.6)",
              boxShadow: `0 0 20px ${LiquidGlass.colors.neonCyan}20` 
            }}
          >
            <div className="p-1.5 bg-cyan-500/20 rounded-md animate-pulse">
                <Brain className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
                    Neural Reasoning
                </div>
                <div className="text-sm text-gray-200 font-mono leading-relaxed">
                    {thought}
                </div>
            </div>
          </motion.div>
        )}

        {/* 2. Ghost Text Overlay (Center/Full) */}
        {ghostText && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"
           >
              <div className="w-[80%] max-h-[80%] overflow-hidden relative rounded-lg border border-white/10 bg-[#1e1e1e]">
                 <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-cyan-500 to-transparent animate-progress-indeterminate" />
                 <div className="p-4 font-mono text-sm text-gray-500 whitespace-pre-wrap">
                    {ghostText}
                 </div>
                 <div className="absolute bottom-4 right-4 flex gap-2 items-center">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                    <span className="text-xs text-cyan-400">Synthesizing Code...</span>
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
