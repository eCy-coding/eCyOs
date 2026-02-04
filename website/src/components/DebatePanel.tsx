
import React, { useState, useEffect, useRef } from 'react';
import { useBrainLink } from '../hooks/useBrainLink';
import { LiquidGlass } from '../theme/LiquidGlass';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, BrainCircuit, Gavel, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'proposer' | 'critic' | 'judge' | 'user';
  content: string;
  timestamp: number;
}

export const DebatePanel: React.FC = () => {
  const { thoughtStream } = useBrainLink();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const lastProcessedThought = useRef<string | null>(null);
  
  // Simulate receiving thoughts as debate messages for this mocked version
  useEffect(() => {
    if (thoughtStream.length > 0) {
      const latest = thoughtStream[0];
      
      // Prevent redundant updates if the thought hasn't changed
      if (latest === lastProcessedThought.current) return;
      lastProcessedThought.current = latest;

      // Simple heuristic to assign roles based on content content keywords for demo
      let role: Message['role'] = 'proposer';
      if (latest.toLowerCase().includes("critic") || latest.toLowerCase().includes("error")) role = 'critic';
      if (latest.toLowerCase().includes("verdict") || latest.toLowerCase().includes("judge")) role = 'judge';
      
      const newMessage: Message = {
        id: Date.now().toString(),
        role,
        content: latest,
        timestamp: Date.now()
      };
      
      // eslint-disable-next-line
      setMessages(prev => [newMessage, ...prev].slice(0, 50));
    }
  }, [thoughtStream]);

  const getIcon = (role: string) => {
    switch(role) {
      case 'proposer': return <Bot className="w-5 h-5 text-cyan-400" />;
      case 'critic': return <BrainCircuit className="w-5 h-5 text-red-500" />;
      case 'judge': return <Gavel className="w-5 h-5 text-purple-500" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getColor = (role: string) => {
    switch(role) {
      case 'proposer': return LiquidGlass.colors.neonCyan;
      case 'critic': return "#ef4444";
      case 'judge': return LiquidGlass.colors.neonMagenta;
      default: return "#ffffff";
    }
  };

  return (
    <div 
      className="flex flex-col h-full overflow-hidden relative"
      style={{
        background: `linear-gradient(to bottom, ${LiquidGlass.colors.deepSpace}, #000)`,
        border: `1px solid ${LiquidGlass.colors.glassBorder}`,
        borderRadius: '12px'
      }}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <h2 className="text-sm font-bold tracking-widest text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500">
                COUNCIL OF WISDOM
            </h2>
        </div>
        <div className="flex gap-2 text-[10px] uppercase font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>Proposer</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>Critic</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>Judge</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
                <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group"
                >
                    <div 
                        className={`flex gap-3 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01]`}
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            borderColor: "rgba(255,255,255,0.05)",
                            boxShadow: `0 4px 20px -2px ${getColor(msg.role)}10` // subtle glow based on role
                        }}
                    >
                        <div className="mt-1 p-2 rounded-lg bg-black/40 h-fit border border-white/5">
                            {getIcon(msg.role)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getColor(msg.role) }}>
                                    {msg.role}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed font-light">
                                {msg.content}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
          </AnimatePresence>
          {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-mono">
                  WAITING FOR SYNAPSE ACTIVITY...
              </div>
          )}
      </div>
      
      {/* Input / Action Bar */}
      <div className="p-3 border-t border-white/10 bg-black/20 backdrop-blur-sm">
         <div className="text-[10px] text-center text-gray-600 font-mono">
            Council is in OBSERVATION MODE. Actions are autonomous.
         </div>
      </div>
    </div>
  );
};
