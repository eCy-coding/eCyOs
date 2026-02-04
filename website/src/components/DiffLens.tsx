import React, { useState, useMemo } from 'react';
import { ToolShell } from './ToolShell';
import { Cpu, ArrowRightLeft } from 'lucide-react';
import * as Diff from 'diff';

export const DiffLens: React.FC = () => {
    const [oldText, setOldText] = useState('const foo = "bar";\nreturn foo;');
    const [newText, setNewText] = useState('const foo = "baz";\nconsole.log(foo);\nreturn foo;');

    const diff = useMemo(() => {
        return Diff.diffLines(oldText, newText);
    }, [oldText, newText]);

    return (
        <ToolShell title="Diff Lens" icon={<Cpu />} color="text-indigo-400">
             <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto">
                 
                 {/* Inputs */}
                 <div className="grid grid-cols-2 gap-6 h-1/3 min-h-[200px]">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-white/40 font-mono uppercase text-center">Original</label>
                        <textarea
                            value={oldText}
                            onChange={(e) => setOldText(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/70 focus:outline-none focus:border-indigo-500/30 resize-none"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-white/40 font-mono uppercase text-center">Modified</label>
                        <textarea
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/70 focus:outline-none focus:border-indigo-500/30 resize-none"
                        />
                    </div>
                 </div>

                 {/* Visualizer */}
                 <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <label className="text-xs text-white/40 font-mono uppercase flex items-center gap-2">
                        <ArrowRightLeft size={12} /> Diff Visualization
                    </label>
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {diff.map((part, index) => {
                            const color = part.added ? 'bg-green-500/20 text-green-300' :
                                          part.removed ? 'bg-red-500/20 text-red-300' :
                                          'text-white/50';
                            const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
                            
                            return (
                                <span key={index} className={`block px-2 ${color} border-l-2 ${part.added ? 'border-green-500' : part.removed ? 'border-red-500' : 'border-transparent'}`}>
                                    {prefix}{part.value}
                                </span>
                            );
                        })}
                    </div>
                 </div>

             </div>
        </ToolShell>
    );
};
