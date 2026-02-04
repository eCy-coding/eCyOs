import React, { useState, useMemo } from 'react';
import { ToolShell } from './ToolShell';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';

export const RegexLab: React.FC = () => {
    const [pattern, setPattern] = useState(String.raw`\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b`);
    const [flags, setFlags] = useState('gi');
    const [testString, setTestString] = useState('Contact us at support@antigravity.io or admin@ecy-os.dev for assistance.');

    const { matchResult, error } = useMemo(() => {
        try {
            const regex = new RegExp(pattern, flags);
            const matches = Array.from(testString.matchAll(regex));
            return { matchResult: matches, error: null };
        } catch (e) {
            return { matchResult: [], error: (e as Error).message };
        }
    }, [pattern, flags, testString]);

    // Simple highlighter
    const highlightedText = useMemo(() => {
        if (error || !pattern) return testString;
        try {
            const regex = new RegExp(`(${pattern})`, flags);
            return testString.split(regex).map((part, i) => 
                regex.test(part) ? <span key={i} className="bg-pink-500/40 text-white rounded px-1 border border-pink-500/50">{part}</span> : part
            );
        } catch {
            return testString;
        }
    }, [pattern, flags, testString, error]);

    return (
        <ToolShell title="Regex Laboratory" icon={<Search />} color="text-pink-400">
            <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto">
                
                {/* Pattern Input */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-pink-400 font-mono text-xl">/</div>
                        <input
                            type="text"
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            className={`w-full bg-black/40 border rounded-xl pl-8 pr-4 py-4 font-mono text-lg text-white focus:outline-none transition-all
                                ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-pink-500/50'}
                            `}
                            placeholder="Enter regex pattern..."
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-pink-400 font-mono text-xl">/</div>
                    </div>
                    <input
                        type="text"
                        value={flags}
                        onChange={(e) => setFlags(e.target.value)}
                        className="w-24 bg-black/40 border border-white/10 rounded-xl px-4 py-4 font-mono text-lg text-white/70 focus:outline-none focus:border-pink-500/50 text-center"
                        placeholder="flags"
                    />
                </div>

                {error && (
                   <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg text-sm">
                       <AlertCircle size={16} />
                       {error}
                   </div> 
                )}

                {/* Test Area */}
                <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                    
                    {/* Input String */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-white/40 font-mono uppercase">Test String</label>
                        <textarea
                            value={testString}
                            onChange={(e) => setTestString(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-white/80 focus:outline-none focus:border-pink-500/30 resize-none"
                            placeholder="Paste text to test..."
                        />
                    </div>

                    {/* Visualizer output */}
                     <div className="flex flex-col gap-2">
                        <label className="text-xs text-white/40 font-mono uppercase">Match Visualization</label>
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm text-white/60 overflow-auto whitespace-pre-wrap leading-relaxed">
                            {highlightedText}
                        </div>
                    </div>
                </div>

                {/* Match Details */}
                <div className="h-32 bg-black/20 border border-white/5 rounded-xl p-4 overflow-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={14} className="text-pink-400" />
                        <span className="text-xs font-bold text-white/50 uppercase">Matches Found: {matchResult.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {matchResult.map((m, i) => (
                            <div key={i} className="bg-pink-900/20 border border-pink-500/20 rounded px-2 py-1 text-xs font-mono text-pink-300">
                                #{i + 1}: "{m[0]}" <span className="text-white/30 ml-1">@{m.index}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </ToolShell>
    );
};
