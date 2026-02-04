import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, ShieldCheck, Terminal, HardDrive } from "lucide-react";
import { Calculator } from "./Calculator";

interface ArtifactPanelProps {
  terminalLines?: string[];
}

export default function ArtifactPanel({ terminalLines = [] }: ArtifactPanelProps) {
  const [activeTab, setActiveTab] = useState<'artifacts' | 'terminal'>('artifacts');
  const [selectedArtifact, setSelectedArtifact] = useState<number | null>(null);

  const artifacts = [
    { 
      id: 1, 
      name: "strategic_report_v1006.md", 
      type: "plan", 
      status: "Approved",
      content: "# Strategic Report v1006\n\n**Mission:** Achieve AGI via Quantum-Graph Integration.\n\n## Objectives\n- [x] Phase 1: Core\n- [x] Phase 2: Memory\n- [ ] Phase 3: Autonomy" 
    },
    { 
      id: 2, 
      name: "implementation_plan.md", 
      type: "plan", 
      status: "Approved",
      content: "# Implementation Plan\n\nSee `implementation_plan.md` for full details." 
    },
    { 
      id: 3, 
      name: "verify_brain_v1005.py", 
      type: "code", 
      status: "Verified",
      content: "def verify_brain():\n    print('Brain Online')\n    return True" 
    },
    {
      id: 4,
      name: "interactive_demo.md",
      type: "active",
      status: "Live",
      content: "# Interactive Research Lab\n\nTesting the Quantum Calculator embedded in docs.\n\n<Calculator />\n\n**Note:** This is a live React component rendered within Markdown."
    }
  ];

  return (
    <div className="h-full w-full rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col">
      <div className="p-2 border-b border-white/5 flex gap-2">
        <button 
          onClick={() => setActiveTab('artifacts')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'artifacts' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
        >
          <HardDrive className="w-3.5 h-3.5" /> Artifacts
        </button>
        <button 
          onClick={() => setActiveTab('terminal')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'terminal' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
        >
          <Terminal className="w-3.5 h-3.5" /> Console
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
        {activeTab === 'artifacts' ? (
          <div className="relative h-full">
            <AnimatePresence mode="wait">
              {!selectedArtifact ? (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-2 h-full"
                >
                  {artifacts.map((art) => (
                    <motion.div 
                      layoutId={`artifact-${art.id}`}
                      key={art.id} 
                      onClick={() => setSelectedArtifact(art.id)}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${art.type === 'code' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {art.type === 'code' ? <Cpu className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                            {art.name}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            {art.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium border border-green-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {art.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col"
                >
                  <button 
                    onClick={() => setSelectedArtifact(null)}
                    className="mb-4 text-xs text-cyan-400 hover:text-white flex items-center gap-1"
                  >
                    ← Back to Artifacts
                  </button>
                  <div className="flex-1 bg-black/50 rounded-lg p-4 overflow-y-auto border border-white/5 font-mono text-xs leading-relaxed text-gray-300">
                     <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore - Custom component "calculator" is not in strict types but supported by rehype-raw
                            calculator: () => <div className="my-4 h-96 border border-white/10 rounded-xl overflow-hidden"><Calculator demoMode={true} /></div>
                        }}
                     >
                        {artifacts.find(a => a.id === selectedArtifact)?.content || ''}
                     </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="font-mono text-xs space-y-1 p-2">
             {terminalLines.length > 0 ? terminalLines.map((line, i) => (
               <div key={i} className="flex gap-2">
                 <span className="text-green-500/50 select-none">$</span>
                 <p className="text-gray-300 break-all">{line}</p>
               </div>
             )) : (
               <div className="text-gray-600 italic text-center mt-10">
                 System Terminal Idle...
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
