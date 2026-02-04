import React, { useState, useEffect, useRef } from 'react';
import { ToolShell } from './ToolShell';
import { Network, Activity, Shield, Wifi } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Packet {
    id: string;
    timestamp: string;
    source: string;
    dest: string;
    protocol: string;
    size: number;
    status: 'allow' | 'block' | 'warn';
}

export const NetworkSentinel: React.FC = () => {
    const [packets, setPackets] = useState<Packet[]>([]);
    const [trafficData, setTrafficData] = useState<{ time: string, in: number, out: number }[]>([]);
    const [isScanning, setIsScanning] = useState(true);
    const workerRef = useRef<Worker | null>(null);

    // Initialize Worker
    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/traffic.worker.ts', import.meta.url), { type: 'module' });
        
        workerRef.current.onmessage = (e) => {
            const { packets: newPackets, stats } = e.data;
            
            setPackets(prev => [...newPackets, ...prev].slice(0, 15));
            
            setTrafficData(prev => {
                const newData = {
                    time: new Date().toLocaleTimeString(),
                    in: stats.in,
                    out: stats.out
                };
                return [...prev, newData].slice(-20); // Keep last 20 ticks
            });
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Control Worker
    useEffect(() => {
        if (workerRef.current) {
            workerRef.current.postMessage(isScanning ? 'start' : 'stop');
        }
    }, [isScanning]);

    return (
        <ToolShell title="Network Sentinel" icon={<Network />} color="text-emerald-400">
            <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto">
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-emerald-400 font-mono text-sm uppercase tracking-wider">
                            {isScanning ? 'Monitoring Active' : 'Monitoring Paused'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setIsScanning(!isScanning)}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono transition-colors"
                    >
                        {isScanning ? 'PAUSE' : 'RESUME'}
                    </button>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    
                    {/* Traffic Graph */}
                    <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
                        <h3 className="text-white/40 text-xs font-mono uppercase mb-4 flex items-center gap-2">
                            <Activity size={14} /> Bandwidth Usage (Mbps)
                        </h3>
                        <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trafficData}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="in" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
                                    <Area type="monotone" dataKey="out" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOut)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                        <StatCard label="Packets/Sec" value={Math.floor(Math.random() * 500) + 1200} icon={<Wifi size={16} className="text-emerald-400"/>} />
                        <StatCard label="Threats Blocked" value={Math.floor(Math.random() * 5)} icon={<Shield size={16} className="text-red-400"/>} />
                        <div className="mt-auto p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                            <div className="text-xs text-emerald-400/60 font-mono mb-2">SYSTEM STATUS</div>
                            <div className="text-emerald-400 font-bold tracking-widest">SECURE</div>
                        </div>
                    </div>

                    {/* Packet Log */}
                    <div className="lg:col-span-3 bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col overflow-hidden">
                        <div className="grid grid-cols-6 text-xs text-white/40 font-mono uppercase mb-2 px-2">
                            <span>Time</span>
                            <span>Source</span>
                            <span>Dest</span>
                            <span>Protocol</span>
                            <span>Size</span>
                            <span>Status</span>
                        </div>
                        <div className="flex-1 overflow-auto space-y-1 font-mono text-xs">
                            {packets.map((p) => (
                                <div key={p.id} className="grid grid-cols-6 px-2 py-1.5 hover:bg-white/5 rounded transition-colors items-center border-b border-white/5 last:border-0 text-white/70">
                                    <span>{p.timestamp}</span>
                                    <span>{p.source}</span>
                                    <span>{p.dest}</span>
                                    <span className={`
                                        ${p.protocol === 'HTTPS' ? 'text-green-400' : p.protocol === 'TCP' ? 'text-blue-400' : 'text-purple-400'}
                                    `}>{p.protocol}</span>
                                    <span>{p.size}B</span>
                                    <span className={`
                                        ${p.status === 'allow' ? 'text-emerald-500' : p.status === 'block' ? 'text-red-500 font-bold' : 'text-yellow-500'}
                                    `}>{p.status.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </ToolShell>
    );
};

const StatCard = ({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) => (
    <div className="bg-white/5 rounded-lg p-3">
        <div className="flex justify-between items-start mb-1">
            <span className="text-xs text-white/40 font-mono uppercase">{label}</span>
            {icon}
        </div>
        <div className="text-2xl font-mono text-white">{value.toLocaleString()}</div>
    </div>
);
