
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Type, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const QrNexus: React.FC = () => {
    const [text, setText] = useState('https://antigravity.google');
    const [fgColor, setFgColor] = useState('#06b6d4'); // Cyan
    const [bgColor, setBgColor] = useState('#000000'); // Black
    const svgRef = useRef<SVGSVGElement>(null);
    const [downloaded, setDownloaded] = useState(false);

    const downloadQR = () => {
        if (!svgRef.current) return;
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
            canvas.width = img.width + 40; // Add padding
            canvas.height = img.height + 40;
            if (ctx) {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
                const pngUrl = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.href = pngUrl;
                downloadLink.download = "qr-nexus-code.png";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                setDownloaded(true);
                setTimeout(() => setDownloaded(false), 2000);
            }
        };
        img.src = url;
    };

    return (
        <div className="flex w-full h-full max-w-5xl mx-auto p-4 gap-6 items-center justify-center">
            
            {/* Controls */}
            <motion.div 
                layout
                className="w-1/2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl"
            >
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                            <QrCode className="text-cyan-400" size={24} />
                        </div>
                        QR Nexus
                    </h2>
                    <p className="text-xs text-white/50 font-mono mt-1 ml-14">QUANTUM MATRIX GENERATOR</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase font-bold text-white/40 flex items-center gap-2">
                        <Type size={14} /> Data Payload
                    </label>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter URL or text..."
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase font-bold text-white/40">Dot Color</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                            <span className="text-xs font-mono text-white/60">{fgColor}</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase font-bold text-white/40">Background</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                            <span className="text-xs font-mono text-white/60">{bgColor}</span>
                        </div>
                     </div>
                </div>
            </motion.div>

            {/* Preview */}
            <motion.div 
                layout
                className="w-1/2 flex flex-col items-center justify-center gap-8"
            >
                <div 
                    className="p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-white/5 backdrop-blur-sm transition-all hover:scale-105 duration-300"
                    style={{ backgroundColor: bgColor }} // Preview background matches
                >
                    <QRCodeSVG 
                        value={text || 'https://antigravity.google'} 
                        size={256}
                        fgColor={fgColor}
                        bgColor={bgColor} // Actually transparent in SVG usually better, but user asked for bg control
                        level="H"
                        includeMargin={false}
                        ref={svgRef}
                    />
                </div>

                <button 
                    onClick={downloadQR}
                    className={`
                        px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all
                        ${downloaded 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                        }
                    `}
                >
                    {downloaded ? <Check size={18} /> : <Download size={18} />}
                    {downloaded ? 'Saved to System' : 'Download Matrix'}
                </button>
            </motion.div>

        </div>
    );
};
