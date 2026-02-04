
import React, { useState, useEffect } from 'react';
import { create, all } from 'mathjs';
import { Display } from './Display';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, FunctionSquare, Calculator as CalcIcon } from 'lucide-react';

// Initialize mathjs with BigNumber configuration for precision
const math = create(all, {
  number: 'BigNumber',
  precision: 64
});

type Mode = 'basic' | 'scientific';

export const LogicEngine: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [isError, setIsError] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('basic');

  // Auto-calculate result (ghost preview)
  useEffect(() => {
    if (!expression) {
      setResult('');
      return;
    }
    
    // Don't calculate incomplete expressions
    if (/[\+\-\*\/]$/.test(expression)) return;
    if (expression.split('(').length !== expression.split(')').length) return; // Unbalanced parens

    try {
      // Evaluate expression safely
      const evalResult = math.evaluate(expression);
      if (typeof evalResult === 'number' || typeof evalResult === 'object') {
          setResult(String(evalResult));
      }
      setIsError(false);
    } catch (e) {
      // Don't flag error on intermediate typing unless explicitly executed
    }
  }, [expression]);

  const handleKeyPress = (key: string) => {
    if (key === 'AC') {
        setExpression('');
        setResult(''); // Clear result
        setIsError(false);
    } else if (key === 'DEL') {
        setExpression((prev) => prev.slice(0, -1));
    } else if (key === '=') {
      try {
        if (!expression) return;
        const evalResult = math.evaluate(expression);
        const finalRes = String(evalResult);
        
        setHistory((prev) => [...prev, `${expression} = ${finalRes}`]);
        setExpression(finalRes);
        setResult(''); // Clear ghost result
        setIsError(false);
      } catch (e) {
          setIsError(true);
          setResult('Error');
      }
    } else if (key === 'ANS') {
        if (history.length > 0) {
            const lastEntry = history[history.length - 1];
            const lastResult = lastEntry.split('=')[1].trim();
            setExpression(prev => prev + lastResult);
        }
    } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(key)) {
        setExpression(prev => prev + key + '(');
    } else {
      setExpression((prev) => prev + key);
    }
  };

  const BasicKeys = [
    'AC', 'DEL', '%', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', 'ANS', '='
  ];

  const SciKeys = [
    '(', ')', '^', 'sqrt',
    'sin', 'cos', 'tan', 'log', 
    'ln', 'pi', 'e', '!'
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto h-full">
        {/* Mode Switcher */}
        <div className="w-full flex justify-end mb-4">
            <button 
                onClick={() => setMode(mode === 'basic' ? 'scientific' : 'basic')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 hover:bg-white/10 transition-colors"
            >
                {mode === 'basic' ? <FunctionSquare size={14} /> : <CalcIcon size={14} />}
                {mode === 'basic' ? 'SCIENTIFIC MODE' : 'BASIC MODE'}
            </button>
        </div>

        <motion.div 
            layout
            className="w-full bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
            
            <Display 
                expression={expression} 
                result={result} 
                isError={isError} 
            />
            
            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="flex gap-4">
                {/* Scientific Keys (Collapsible) */}
                <AnimatePresence>
                    {mode === 'scientific' && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 'auto', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="grid grid-cols-2 gap-2 overflow-hidden"
                        >
                            {SciKeys.map(k => (
                                <Button key={k} label={k} onClick={() => handleKeyPress(k)} variant="sci" />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Basic Keys */}
                <div className={`grid grid-cols-4 gap-3 flex-1 transition-all duration-300`}>
                    {BasicKeys.map((k) => (
                        <Button 
                            key={k} 
                            label={k} 
                            onClick={() => handleKeyPress(k)} 
                            variant={['AC', 'DEL'].includes(k) ? 'danger' : ['=', 'ANS'].includes(k) ? 'primary' : ['/', '*', '-', '+'].includes(k) ? 'accent' : 'default'} 
                        />
                    ))}
                </div>
            </div>
            
        </motion.div>

        {/* Neural History */}
        <div className="mt-6 w-full max-w-xl">
            <h3 className="text-cyan-200/50 text-[10px] uppercase tracking-widest mb-2 px-2 flex items-center justify-between">
                <span>Neuro-Link History</span>
                <button onClick={() => setHistory([])} className="hover:text-red-400 transition-colors"><RotateCcw size={10} /></button>
            </h3>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto no-scrollbar mask-fade-bottom">
                <AnimatePresence>
                {history.slice().reverse().map((item, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="text-white/40 text-sm font-mono px-4 py-2 rounded-lg bg-white/5 border border-white/5 truncate hover:bg-white/10 transition-colors cursor-pointer flex justify-between group"
                        onClick={() => setExpression(item.split('=')[1].trim())}
                    >
                        <span>{item.split('=')[0]}</span>
                        <span className="text-cyan-400 group-hover:text-cyan-300">= {item.split('=')[1]}</span>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
};

const Button = ({ label, onClick, variant = 'default' }: { label: string, onClick: () => void, variant?: 'default' | 'primary' | 'accent' | 'danger' | 'sci' }) => {
    const base = "h-12 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-all duration-150 active:scale-95 border";
    const styles = {
        default: "bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/20",
        primary: "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
        accent: "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20",
        danger: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20",
        sci: "bg-blue-500/5 border-blue-500/20 text-blue-300 hover:bg-blue-500/10 text-xs"
    };

    return (
        <button className={`${base} ${styles[variant]}`} onClick={onClick}>
            {label}
        </button>
    );
}
