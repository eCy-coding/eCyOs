import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

interface MutationEvent {
  id: string;
  file: string;
  complexityDrop: number;
  status: 'pending' | 'success' | 'reverted';
  timestamp: string;
}

export default function EvolutionPanel() {
  const [entropy, setEntropy] = useState(12); // Mock initial complexity
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mutations] = useState<MutationEvent[]>([
    { id: 'm1', file: 'vision.py', complexityDrop: 3, status: 'success', timestamp: '10:42 AM' },
    { id: 'm2', file: 'router.py', complexityDrop: 5, status: 'reverted', timestamp: '10:45 AM' },
  ]);

  // Simulate live evolution updates
  useEffect(() => {
    const interval = setInterval(() => {
        // Randomly fluctuate entropy for "live" feel
        setEntropy(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.6))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            Ouroboros Protocol
        </h3>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">
            <Activity className="w-3 h-3 animate-pulse text-green-400" />
            <span>Active</span>
        </div>
      </div>

      {/* Entropy Meter */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
            <span>System Entropy</span>
            <span>{entropy.toFixed(1)} / 100</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
                className={`h-full ${entropy > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                animate={{ width: `${entropy}%` }}
                transition={{ type: "spring", stiffness: 50 }}
            />
        </div>
      </div>

      {/* Mutation Log */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {mutations.map(m => (
            <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5 text-xs">
                <div className="flex flex-col">
                    <span className="text-white font-mono">{m.file}</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                        Complexity -{m.complexityDrop} 
                    </span>
                </div>
                <div className={`p-1 rounded-md ${
                    m.status === 'success' ? 'bg-green-500/20 text-green-400' : 
                    m.status === 'reverted' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                    {m.status === 'success' && <ShieldCheck className="w-3.5 h-3.5" />}
                    {m.status === 'reverted' && <AlertTriangle className="w-3.5 h-3.5" />}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
