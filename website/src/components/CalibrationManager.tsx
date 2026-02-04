import React, { useState, useRef } from 'react';
import { Zap } from 'lucide-react';

export const CalibrationManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stats, setStats] = useState({ fps: 60, memory: 0, drops: 0 });
    const [isRunning, setIsRunning] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    
    // Fix: Initialize refs with null/undefined explicitly for TS
    const requestRef = useRef<number | null>(null);
    const workersRef = useRef<Worker[]>([]);

    const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

    const runStorm = async () => {
        setIsRunning(true);
        addLog("INITIATING 10-SITE SWARM PROTOCOL...");

        // 1. FPS Monitor
        let frameCount = 0;
        let lastTime = performance.now();
        
        const animate = (time: number) => {
            frameCount++;
            if (time - lastTime >= 1000) {
                const fps = frameCount;
                setStats(prev => ({ 
                    ...prev, 
                    fps,
                    drops: fps < 55 ? prev.drops + 1 : prev.drops
                }));
                frameCount = 0;
                lastTime = time;
            }
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);

        // 2. Network Storm (Spin up 10 workers for "10-Site Protocol")
        addLog("SPAWNING 10 NETWORK SENTINEL WORKERS...");
        for(let i=0; i<10; i++) {
             const w = new Worker(new URL('../workers/traffic.worker.ts', import.meta.url), { type: 'module' });
             w.postMessage('start');
             workersRef.current.push(w);
        }

        // 3. Crypto Crunch (Main Thread Hashing Simulation)
        addLog("INJECTING CRYPTO LOAD (MAIN THREAD)...");
        const interval = setInterval(() => {
            // Light load to allow UI updates, but noticeable
            for(let i=0; i<1000; i++) {
                JSON.stringify({ test: Math.random() });
            }
        }, 16); // Every frame target

        // Duration: 10 Seconds
        setTimeout(() => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            clearInterval(interval);
            workersRef.current.forEach(w => w.terminate());
            workersRef.current = [];
            setIsRunning(false);
            addLog("PROTOCOL COMPLETE.");
            addLog(`FINAL REPORT: Drops=${stats.drops} | MinFPS=${stats.fps}`);
        }, 10000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-[600px] bg-black border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                        <Zap className="animate-pulse" /> SWARM CALIBRATION
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">CLOSE</button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-lg text-center">
                        <div className={`text-3xl font-mono font-bold ${stats.fps < 30 ? 'text-red-500' : stats.fps < 55 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {stats.fps}
                        </div>
                        <div className="text-xs text-white/50">FPS</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg text-center">
                        <div className="text-3xl font-mono font-bold text-cyan-400">
                            {workersRef.current.length}
                        </div>
                        <div className="text-xs text-white/50">ACTIVE WORKERS</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg text-center">
                        <div className="text-3xl font-mono font-bold text-red-400">
                            {stats.drops}
                        </div>
                        <div className="text-xs text-white/50">FRAME DROPS</div>
                    </div>
                </div>

                <div className="h-40 bg-black/50 rounded border border-white/10 p-2 overflow-hidden font-mono text-xs text-white/70 mb-6">
                    {log.map((l, i) => <div key={i}>{l}</div>)}
                </div>

                {!isRunning ? (
                    <button 
                        onClick={runStorm}
                        className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 font-bold tracking-widest transition-all"
                    >
                        INITIATE 10-SITE PROTOCOL
                    </button>
                ) : (
                    <div className="w-full py-3 text-center text-cyan-400/50 animate-pulse border border-cyan-500/20 rounded">
                        STRESS TEST IN PROGRESS...
                    </div>
                )}
            </div>
        </div>
    );
};
