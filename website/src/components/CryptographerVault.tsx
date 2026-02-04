import React, { useState } from 'react';
import { ToolShell } from './ToolShell';
import { Lock, MoveRight, Copy } from 'lucide-react';
import CryptoJS from 'crypto-js';

export const CryptographerVault: React.FC = () => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'Base64'>('SHA256');

    let output = '';
    try {
        switch (mode) {
            case 'MD5': output = CryptoJS.MD5(input).toString(); break;
            case 'SHA1': output = CryptoJS.SHA1(input).toString(); break;
            case 'SHA256': output = CryptoJS.SHA256(input).toString(); break;
            case 'SHA512': output = CryptoJS.SHA512(input).toString(); break;
            case 'Base64': output = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input)); break;
        }
    } catch (e) {
        output = 'Error processing input';
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <ToolShell title="Crypto Vault" icon={<Lock />} color="text-red-400">
            <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto gap-8">
                
                {/* Mode Selector */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {['MD5', 'SHA1', 'SHA256', 'SHA512', 'Base64'].map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m as any)}
                            className={`px-6 py-3 rounded-xl text-sm font-mono border transition-all uppercase tracking-wider
                                ${mode === m 
                                    ? 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                                    : 'bg-black/20 border-white/10 text-white/40 hover:bg-white/5'}
                            `}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                    {/* Background Noise */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

                    {/* Input */}
                    <div className="flex flex-col gap-2 z-10">
                        <label className="text-xs text-white/40 font-mono uppercase">Raw Data</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                            placeholder="Enter text to encrypt..."
                        />
                    </div>

                    {/* Arrow (Desktop) */}
                    <div className="hidden md:flex justify-center text-white/10 z-10">
                        <MoveRight size={40} />
                    </div>

                    {/* Output */}
                    <div className="flex flex-col gap-2 z-10">
                        <label className="text-xs text-white/40 font-mono uppercase">Encrypted Output</label>
                        <div className="relative w-full h-40 bg-black/60 border border-red-500/20 rounded-xl p-4 font-mono text-sm text-red-300 break-all overflow-auto">
                            {input ? output : <span className="text-white/20 italic">Waiting for input...</span>}
                            
                            {input && (
                                <button 
                                    onClick={copyToClipboard}
                                    className="absolute bottom-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                                    title="Copy Hash"
                                >
                                    <Copy size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-white/30 text-xs font-mono">
                    <ShieldIcon />
                    <span>Client-side encryption. Data never leaves your device.</span>
                </div>

            </div>
        </ToolShell>
    );
};

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
