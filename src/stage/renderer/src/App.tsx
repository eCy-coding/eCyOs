import React, { useState, useEffect } from 'react';
import GlassLayout, { GlassPanel } from './components/GlassLayout';
import DebateVisualizer from './components/DebateVisualizer';
import HardwareMonitor from './components/HardwareMonitor';
import { CortexDashboard } from './components/CortexDashboard';
import BrainDashboard from './components/BrainDashboard';
import { PolyglotPlayground } from './components/PolyglotPlayground';

// Define the interface for the exposed API
interface Task {
    id: string;
    name: string;
    command: string;
    icon: string;
}

interface StageAPI {
  orchestra: {
    execute: (command: string) => Promise<{ status: string; output: string }>;
    task: {
        list: () => Promise<Task[]>;
        add: (task: Omit<Task, 'id'>) => Promise<Task>;
        delete: (id: string) => Promise<boolean>;
    },
    permissions: {
        check: () => Promise<boolean>;
        request: () => Promise<boolean>;
    }
  };
}

declare global {
  interface Window {
    stage: StageAPI;
  }
}

function App(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<string[]>(['[System] eCy OS v1005.0 Initialized.', '[System] Master Portal Online.']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [logs]);

  const loadTasks = async () => {
    try {
        if (!window.stage) return; // Dev mode safety
        const list = await window.stage.orchestra.task.list();
        setTasks(list);
    } catch (e) {
        addLog(`Error loading tasks: ${e}`);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  return (
    <GlassLayout>
       {/* Header */}
       <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/20" />
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white neon-text">eCy OS</h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Omni-Intelligence <span className="text-cyan-400">v1005.0</span></p>
            </div>
         </div>
         <div className="flex gap-4">
             <button className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/5 rounded-md hover:bg-white/10 transition-colors">
                SETTINGS
             </button>
             <button className="px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-md hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20">
                CONNECT
             </button>
         </div>
       </header>

       {/* Main Grid */}
       <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
          
          {/* Left: Control Deck (3 cols) */}
          <div className="col-span-3 flex flex-col gap-6">
             {/* Tasks Panel */}
             <GlassPanel className="flex-1 overflow-hidden flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Protocol Deck</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {tasks.map(task => (
                        <button 
                            key={task.id}
                            className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-violet-500/30 group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform duration-300">{task.icon}</span>
                                <div>
                                    <div className="text-sm font-medium text-slate-200">{task.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono  truncate">{task.command}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                    {tasks.length === 0 && <div className="text-slate-600 text-xs text-center py-10">No protocols loaded</div>}
                </div>
             </GlassPanel>

             {/* Mini Dashboard */}
             <GlassPanel className="h-48">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Neural Status</h3>
                 <div className="flex items-center justify-center h-full">
                     <span className="text-4xl">🧠</span>
                 </div>
             </GlassPanel>
          </div>

          {/* Center: The Cortex (6 cols) */}
          <div className="col-span-6 flex flex-col gap-6">
             <BrainDashboard />
             <DebateVisualizer />
          </div>

          {/* Right: Vitals (3 cols) */}
          <div className="col-span-3 flex flex-col gap-6">
             <HardwareMonitor />
             {/* Polyglot Playground (Mini) */}
             <GlassPanel className="flex-1 flex flex-col">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Executor Log</h3>
                 <div className="flex-1 bg-black/20 rounded-lg p-2 font-mono text-[10px] text-green-400/80 overflow-y-auto">
                    {`> Initializing Executor...\n> Ready for commands.`}
                 </div>
             </GlassPanel>
          </div>

       </div>

       {/* Bottom: Logs */}
       <div className="h-48 px-6 pb-6 pt-0">
          <GlassPanel className="h-full flex flex-col">
             <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Event Stream</h3>
                <span className="text-[10px] text-green-500 animate-pulse">● LIVE</span>
             </div>
             <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="text-slate-400 hover:bg-white/5 px-1 rounded cursor-default flex gap-2">
                        <span className="opacity-50 w-16 shrink-0">{log.split(']')[0] + ']'}</span>
                        <span className="text-slate-300">{log.split(']').slice(1).join(']')}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
             </div>
          </GlassPanel>
       </div>
    </GlassLayout>
  );
}

export default App;
