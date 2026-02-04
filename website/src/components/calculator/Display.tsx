
import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface DisplayProps {
    expression: string;
    result: string;
    isError: boolean;
}

export const Display: React.FC<DisplayProps> = ({ expression, result, isError }) => {
    return (
        <div className="flex flex-col items-end justify-end h-32 w-full font-mono relative">
             {/* Ghost Result Preview */}
             {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.5, y: 0 }}
                    className="absolute bottom-1 mr-1 text-cyan-300/50 text-xl pointer-events-none select-none blur-[0.5px]"
                >
                    = {result}
                </motion.div>
            )}

            {/* Main Input Display */}
            <input 
                type="text" 
                value={expression}
                readOnly
                className={clsx(
                    "w-full bg-transparent text-right text-4xl font-light focus:outline-none transition-colors duration-300",
                    isError ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                )}
                placeholder="0"
                style={{ textShadow: isError ? '0 0 10px rgba(255, 0, 0, 0.5)' : '0 0 15px rgba(0, 255, 255, 0.3)' }}
            />
            
            {/* Status Indicator */}
            <div className="absolute top-0 left-0 flex items-center gap-2">
                <div className={clsx("w-2 h-2 rounded-full", isError ? "bg-red-500 animate-pulse" : "bg-green-500")} />
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                    {isError ? 'SYNTAX ERROR' : 'READY'}
                </span>
            </div>
        </div>
    );
};
