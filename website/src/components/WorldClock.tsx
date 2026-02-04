import React, { useState, useEffect } from 'react';
import { ToolShell } from './ToolShell';
import { Clock, Globe } from 'lucide-react';

export const WorldClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const ZONES = [
        { label: 'Local', zone: undefined }, // Local
        { label: 'New York', zone: 'America/New_York' },
        { label: 'London', zone: 'Europe/London' },
        { label: 'Tokyo', zone: 'Asia/Tokyo' },
        { label: 'Silicon Valley', zone: 'America/Los_Angeles' },
        { label: 'Singapore', zone: 'Asia/Singapore' },
    ];

    return (
        <ToolShell title="Chrono Visor" icon={<Clock />} color="text-blue-400">
            <div className="h-full flex items-center justify-center p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                    {ZONES.map((z, i) => (
                        <ClockCard key={i} label={z.label} zone={z.zone} now={time} />
                    ))}
                </div>
            </div>
        </ToolShell>
    );
};

const ClockCard = ({ label, zone, now }: { label: string, zone?: string, now: Date }) => {
    const options: Intl.DateTimeFormatOptions = { 
        timeZone: zone, 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    };
    const timeStr = now.toLocaleTimeString('en-US', options);
    // Cyber aesthetic calc
    // Cyber aesthetic calc
    const s = timeStr.split(':')[2];
    // const [h, m, s] = timeStr.split(':').map(Number);
    
    return (
        <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md overflow-hidden group hover:border-blue-500/30 transition-all hover:scale-105 duration-300">
            {/* Background elements */}
            <div className="absolute -right-4 -top-4 text-white/5 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity">
                <Globe size={96} />
            </div>

            <div className="relative z-10 flex flex-col gap-2">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white/40 uppercase text-xs font-mono tracking-widest">{label}</h3>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </div>
                
                <div className="font-mono text-5xl text-white font-bold tracking-tight">
                    {timeStr}
                </div>
                
                <div className="text-blue-400/60 font-mono text-sm uppercase">
                    {now.toLocaleDateString('en-US', { timeZone: zone, dateStyle: 'full' })}
                </div>

                {/* Progress bar for seconds */}
                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div 
                        className="h-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-linear"
                        style={{ width: `${(parseInt(s as any) / 60) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
