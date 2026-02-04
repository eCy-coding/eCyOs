import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Zap } from 'lucide-react';
import { GlassPanel } from './GlassLayout';

const MetricRow = ({ icon: Icon, label, value, color }: any) => (
  <div className="flex items-center justify-between mb-3 text-sm">
    <div className="flex items-center gap-3 text-slate-400">
      <Icon size={16} className={color} />
      <span>{label}</span>
    </div>
    <div className="font-mono font-medium text-slate-200">{value}</div>
  </div>
);

const ProgressBar = ({ progress, color }: { progress: number, color: string }) => (
  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5 }}
      className={`h-full ${color}`}
    />
  </div>
);

const HardwareMonitor: React.FC = () => {
  // Simulated Specs for "MacBook M4 Max"
  const [cpuUsage, setCpuUsage] = useState(12);
  const [npuUsage, setNpuUsage] = useState(0);
  const [ramUsage, setRamUsage] = useState(32); // 48GB

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(5, prev + (Math.random() * 10 - 5))));
      setNpuUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() * 20 - 10))));
      setRamUsage(prev => Math.min(100, Math.max(30, prev + (Math.random() * 2 - 1))));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassPanel className="h-full min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
            System Vitals (M4 Max)
        </h3>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-green-400 font-mono">ONLINE</span>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {/* CPU */}
        <div>
           <MetricRow icon={Cpu} label="16-Core CPU Load" value={`${cpuUsage.toFixed(1)}%`} color="text-violet-400" />
           <ProgressBar progress={cpuUsage} color="bg-violet-500" />
        </div>

        {/* NPU (Neural Engine) */}
        <div>
           <MetricRow icon={Zap} label="16-Core NPU (Neural)" value={`${npuUsage.toFixed(1)}%`} color="text-cyan-400" />
           <ProgressBar progress={npuUsage} color="bg-cyan-500" />
        </div>

        {/* RAM */}
        <div>
           <MetricRow icon={Database} label="Unified Memory (48GB)" value={`${ramUsage.toFixed(1)}%`} color="text-emerald-400" />
           <ProgressBar progress={ramUsage} color="bg-emerald-500" />
        </div>
        
         {/* System Events */}
        <div className="mt-4 pt-4 border-t border-white/5">
            <div className="text-xs text-slate-500 mb-2 font-mono">LATEST TELEMETRY</div>
             <motion.div 
                key={Math.floor(Date.now() / 2000)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-cyan-200/80 font-mono truncate"
             >
                {`> [kernel] Task scheduler optimized (pid: ${Math.floor(Math.random() * 9000 + 1000)})`}
             </motion.div>
        </div>
      </div>
    </GlassPanel>
  );
};

export default HardwareMonitor;
