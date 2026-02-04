import React from 'react';
import { useBrainLink } from '../hooks/useBrainLink';


/**
 * BrainSynapse: Invisible component that keeps the WebSocket connection alive
 * and feeds the Global Zustand Store.
 * 
 * It can also render a small status indicator.
 */
export const BrainSynapse: React.FC = () => {
    const { isConnected } = useBrainLink();

    return (
        <div className="fixed top-2 right-2 flex items-center gap-2 z-50 pointer-events-none opacity-50">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[10px] font-mono text-white/50 hidden md:block">
                {isConnected ? 'SYNAPSE: ONLINE' : 'SYNAPSE: OFFLINE'}
            </span>
        </div>
    );
};
