import React, { useState } from 'react';
import { ToolShell } from './ToolShell';
import { Palette, Copy, RefreshCw } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import chroma from 'chroma-js';

export const ColorAlchemy: React.FC = () => {
    const [color, setColor] = useState('#06b6d4');
    const [palette, setPalette] = useState<string[]>([]);

    const generatePalette = (base: string) => {
        try {
            const scale = chroma.scale([chroma(base).darken(2), base, chroma(base).brighten(2)]).mode('lch').colors(5);
            setPalette(scale);
        } catch (e) {
            // ignore invalid color
        }
    };

    // Auto-generate on mount or change
    React.useEffect(() => {
        generatePalette(color);
    }, [color]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast could go here
    };

    let hex = color;
    let rgb = '';
    let hsl = '';
    
    try {
        rgb = chroma(color).css();
        hsl = chroma(color).css('hsl');
    } catch (e) {
        rgb = 'Invalid';
    }

    return (
        <ToolShell title="Color Alchemy" icon={<Palette />} color="text-rose-400">
            <div className="h-full flex flex-col md:flex-row gap-8 max-w-5xl mx-auto items-center justify-center">
                
                {/* Picker Side */}
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        <HexColorPicker color={color} onChange={setColor} style={{ width: '250px', height: '250px' }} />
                    </div>
                    <div className="w-full flex gap-2">
                        <div 
                            className="w-full h-12 rounded-xl border border-white/10 shadow-lg transition-all"
                            style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }} 
                        />
                    </div>
                </div>

                {/* Info & Palette Side */}
                <div className="flex-1 w-full flex flex-col gap-6">
                    
                    {/* Values */}
                    <div className="flex flex-col gap-3">
                        <ValueRow label="HEX" value={hex} onCopy={() => copyToClipboard(hex)} />
                        <ValueRow label="RGB" value={rgb} onCopy={() => copyToClipboard(rgb)} />
                        <ValueRow label="HSL" value={hsl} onCopy={() => copyToClipboard(hsl)} />
                    </div>

                    {/* Generated Palette */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-white/40 uppercase text-xs font-mono">
                            <span>Harmonic Scale</span>
                            <button onClick={() => generatePalette(color)} className="hover:text-white transition-colors">
                                <RefreshCw size={12} />
                            </button>
                        </div>
                        <div className="flex h-16 rounded-xl overflow-hidden border border-white/10">
                            {palette.map((c, i) => (
                                <div 
                                    key={i} 
                                    className="flex-1 flex items-center justify-center cursor-pointer hover:flex-[1.5] transition-all duration-300 group"
                                    style={{ backgroundColor: c }}
                                    onClick={() => { setColor(c); copyToClipboard(c); }}
                                >
                                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono mix-blend-difference text-white">
                                        {c}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </ToolShell>
    );
};

const ValueRow = ({ label, value, onCopy }: { label: string, value: string, onCopy: () => void }) => (
    <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-4 group hover:border-white/20 transition-all">
        <span className="w-12 text-xs text-white/40 font-mono">{label}</span>
        <span className="flex-1 font-mono text-white text-lg tracking-wider">{value}</span>
        <button onClick={onCopy} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <Copy size={16} />
        </button>
    </div>
);
