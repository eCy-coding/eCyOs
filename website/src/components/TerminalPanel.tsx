
import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { Maximize2, Minimize2, Terminal as TerminalIcon, X } from 'lucide-react';

interface TerminalPanelProps {
    className?: string;
    onClose?: () => void;
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ className, onClose }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (!terminalRef.current) return;

        // 1. Initialize XTerm
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            theme: {
                background: '#09090b', // Zinc-950
                foreground: '#00f3ff', // Cyan Neon
                cursor: '#00f3ff',
                selectionBackground: '#00f3ff40',
                black: '#000000',
                red: '#ef4444',
                green: '#22c55e',
                yellow: '#eab308',
                blue: '#3b82f6',
                magenta: '#d946ef',
                cyan: '#06b6d4',
                white: '#ffffff',
                brightBlack: '#71717a',
                brightRed: '#f87171',
                brightGreen: '#4ade80',
                brightYellow: '#fde047',
                brightBlue: '#60a5fa',
                brightMagenta: '#f472b6',
                brightCyan: '#67e8f9',
                brightWhite: '#fafafa'
            },
            allowProposedApi: true 
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        
        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // 2. Connect to WebSocket PTY Bridge
        const ws = new WebSocket('ws://localhost:8000/ws/terminal');
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            term.writeln('\x1b[32m[SYSTEM] Uplink established. Accessing Neural Shell...\x1b[0m');
            
            // Send initial resize
            const dims = { cols: term.cols, rows: term.rows };
            ws.send(JSON.stringify(dims));
        };

        ws.onmessage = (event) => {
            term.write(event.data);
        };

        ws.onclose = () => {
            setIsConnected(false);
            term.writeln('\n\x1b[31m[SYSTEM] Uplink severed.\x1b[0m');
        };

        ws.onerror = (err) => {
            console.error("Terminal WS Error", err);
            term.writeln('\n\x1b[31m[ERROR] Connection failed.\x1b[0m');
        };

        // 3. Handle Input
        term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        // 4. Handle Resize
        const handleResize = () => {
            fitAddon.fit();
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ cols: term.cols, rows: term.rows }));
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (ws.readyState === WebSocket.OPEN) ws.close();
            term.dispose();
        };
    }, []);

    // Effect to refit when maximizing
    useEffect(() => {
        if (fitAddonRef.current) {
            // Short timeout to allow CSS transition to finish layout
            setTimeout(() => {
                fitAddonRef.current?.fit();
                // Send new size to backend
                if (xtermRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
                     wsRef.current.send(JSON.stringify({ 
                         cols: xtermRef.current.cols, 
                         rows: xtermRef.current.rows 
                     }));
                }
            }, 300);
        }
    }, [isMaximized]);

    return (
        <div 
            className={`
                bg-black/80 backdrop-blur-xl border border-white/10 rounded-t-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300
                ${isMaximized ? 'fixed inset-4 z-50 h-auto' : `h-64 sm:h-80 w-full ${className || ''}`}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 handle cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs tracking-widest">
                    <TerminalIcon size={14} />
                    <span>SYSTEM_SHELL // {isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                    >
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Terminal Container */}
            <div className="flex-1 relative p-2 overflow-hidden bg-[#09090b]">
                <div ref={terminalRef} className="w-full h-full" />
            </div>
            
            {/* Connection Status Line (Optional) */}
            {!isConnected && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500/50 font-black text-4xl pointer-events-none">
                    NO SIGNAL
                </div>
            )}
        </div>
    );
};

export default TerminalPanel;
