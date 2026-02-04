
import React, { useEffect, useState } from 'react';
import { useIntelligence } from './UnifiedIntelligenceProvider';
import { Activity, Cpu, MessageSquare, Zap } from 'lucide-react';

const OrchestratorPanel: React.FC = () => {
    const { models, fetchModels, selectedModel, selectModel, queryModel } = useIntelligence();
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [mode, setMode] = useState<'direct' | 'debate'>('direct');

    useEffect(() => {
        fetchModels();
    }, []);

    const handleExecute = async () => {
        if (!prompt) return;
        setIsThinking(true);
        setResponse("");
        
        if (mode === 'direct') {
            const result = await queryModel(prompt);
            setResponse(result);
        } else {
            // Mock Debate Sequence for Demo
            setResponse("[COUNCIL SESSION STARTED]\n");
            await new Promise(r => setTimeout(r, 1000));
            setResponse(p => p + `\n[PROPOSER (${selectedModel})]: Analyzing request...`);
            await new Promise(r => setTimeout(r, 1500));
            setResponse(p => p + `\n[CRITIC (Claude-3.5-Sonnet)]: Reviewing logic flaws...`);
            await new Promise(r => setTimeout(r, 1500));
            setResponse(p => p + `\n[JUDGE (GPT-4o)]: Consensus reached. Executing atomic operation.`);
            await new Promise(r => setTimeout(r, 1000));
            
            const result = await queryModel(prompt);
            setResponse(p => p + `\n\n[FINAL RULING]:\n${result}`);
        }
        
        setIsThinking(false);
    };

    return (
        <div className="h-full flex flex-col glass-panel bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden font-mono">
            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Cpu size={18} />
                    <span className="font-bold tracking-wider">UNIVERSAL ROUTER</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        <Activity size={12} className={isThinking ? 'animate-pulse text-green-400' : ''} />
                        <span>STATUS: {isThinking ? 'PROCESSING' : 'IDLE'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Zap size={12} />
                        <span>MODELS: {models.length > 0 ? models.length : 'CONNECTING...'}</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-6 border-b border-white/5 flex gap-4">
                 <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">SELECT NEURAL NODE</label>
                    <select 
                        value={selectedModel}
                        onChange={(e) => selectModel(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none"
                    >
                        {models.length === 0 && <option>Loading Nexus...</option>}
                        {models.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} ({Math.round(m.context_length / 1024)}k ctx)
                            </option>
                        ))}
                    </select>
                 </div>
                 <div className="w-48">
                    <label className="text-xs text-gray-500 mb-1 block">EXECUTION MODE</label>
                    <div className="flex bg-black/60 rounded p-1 border border-white/20">
                        <button 
                            onClick={() => setMode('direct')}
                            className={`flex-1 py-1 text-xs rounded transition-colors ${mode === 'direct' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}
                        >
                            DIRECT
                        </button>
                        <button 
                            onClick={() => setMode('debate')}
                            className={`flex-1 py-1 text-xs rounded transition-colors ${mode === 'debate' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-white'}`}
                        >
                            DEBATE
                        </button>
                    </div>
                 </div>
            </div>

            {/* Input / Output Area */}
            <div className="flex-1 flex flex-col p-6 gap-4 min-h-0">
                <div className="flex-1 bg-black/20 rounded-xl border border-white/5 p-4 overflow-y-auto font-sans text-sm text-gray-300 leading-relaxed custom-scrollbar relative">
                    {response ? (
                        <div className="whitespace-pre-wrap">{response}</div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-4xl font-black uppercase tracking-widest pointer-events-none">
                            AWAITING INPUT
                        </div>
                    )}
                </div>

                <div className="flex gap-2 relative">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter atomic instruction for the Council..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none resize-none h-24 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleExecute();
                            }
                        }}
                    />
                    <button 
                        onClick={handleExecute}
                        disabled={isThinking || !prompt}
                        className="w-24 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed group hover:border-cyan-500/50"
                    >
                         <MessageSquare size={20} className="group-hover:text-cyan-400 transition-colors" />
                         <span className="text-[10px] font-bold tracking-widest text-gray-400 group-hover:text-white">SEND</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrchestratorPanel;
