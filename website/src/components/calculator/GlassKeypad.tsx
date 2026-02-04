
import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface KeypadProps {
    onKeyPress: (key: string) => void;
}

const buttons = [
    { label: 'AC', type: 'danger', val: 'AC' },
    { label: 'DEL', type: 'func', val: 'DEL' },
    { label: '%', type: 'func', val: '%' },
    { label: '/', type: 'op', val: '/' },
    
    { label: 'sin', type: 'sci', val: 'sin(' },
    { label: 'cos', type: 'sci', val: 'cos(' },
    { label: 'tan', type: 'sci', val: 'tan(' },
    { label: 'log', type: 'sci', val: 'log(' },

    { label: 'ln', type: 'sci', val: 'log(' }, // mathjs log is default base e? No, log(x) is base e (ln). log10 is base 10.
    { label: '(', type: 'sci', val: '(' },
    { label: ')', type: 'sci', val: ')' },
    { label: '^', type: 'op', val: '^' },

    { label: '√', type: 'sci', val: 'sqrt(' },
    { label: 'π', type: 'sci', val: 'pi' },
    { label: 'e', type: 'sci', val: 'e' },
    { label: '!', type: 'sci', val: '!' },
    
    { label: '7', type: 'num', val: '7' },
    { label: '8', type: 'num', val: '8' },
    { label: '9', type: 'num', val: '9' },
    { label: '×', type: 'op', val: '*' },

    { label: '4', type: 'num', val: '4' },
    { label: '5', type: 'num', val: '5' },
    { label: '6', type: 'num', val: '6' },
    { label: '-', type: 'op', val: '-' },

    { label: '1', type: 'num', val: '1' },
    { label: '2', type: 'num', val: '2' },
    { label: '3', type: 'num', val: '3' },
    { label: '+', type: 'op', val: '+' },

    { label: '0', type: 'num', val: '0', wide: true },
    { label: '.', type: 'num', val: '.' },
    { label: '=', type: 'action', val: '=' },
];

export const GlassKeypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
    return (
        <div className="grid grid-cols-4 gap-3 w-full">
            {buttons.map((btn, idx) => (
                <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onKeyPress(btn.val)}
                    className={clsx(
                        "h-14 rounded-xl font-medium text-lg flex items-center justify-center transition-all backdrop-blur-md",
                        btn.wide ? "col-span-2" : "col-span-1",
                        
                        // Type-based styling
                        btn.type === 'num' && "bg-white/5 text-white border border-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.1)]",
                        btn.type === 'op' && "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]",
                        btn.type === 'func' && "bg-white/5 text-white/70 border border-white/5",
                        btn.type === 'sci' && "bg-purple-500/10 text-purple-300 border border-purple-500/20 text-sm",
                        btn.type === 'danger' && "bg-red-500/10 text-red-300 border border-red-500/20",
                        btn.type === 'action' && "bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    )}
                >
                    {btn.label}
                </motion.button>
            ))}
        </div>
    );
};
