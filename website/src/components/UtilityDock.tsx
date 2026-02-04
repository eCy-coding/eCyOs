
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Palette, Lock, FileJson, ArrowRightLeft, Cpu,
    BrainCircuit, Database, Box, QrCode,
    Calculator, Terminal, Code2, Network, Search, Clock
} from 'lucide-react';

export type SolutionApp = 'calculator' | 'editor' | 'terminal' | 'converter' | 'regex' | 'json' | 'clock' | 'network' | 'color' | 'crypto' | 'diff' | 'markdown' | 'sql' | 'periodic' | 'qr' | 'debate' | 'docs' | 'artifacts' | 'none';

interface UtilityDockProps {
    activeApp: SolutionApp;
    onLaunch: (app: SolutionApp) => void;
}

const APPS = [
    { id: 'calculator', icon: Calculator, label: 'Omni-Calc', color: 'text-cyan-400' },
    { id: 'terminal', icon: Terminal, label: 'Terminal', color: 'text-green-400' },
    { id: 'editor', icon: Code2, label: 'Editor', color: 'text-yellow-400' },
    { id: 'converter', icon: ArrowRightLeft, label: 'Unit Conv', color: 'text-purple-400' },
    { id: 'regex', icon: Search, label: 'Regex Lab', color: 'text-pink-400' },
    { id: 'json', icon: FileJson, label: 'JSON Refiner', color: 'text-orange-400' },
    { id: 'clock', icon: Clock, label: 'Timekeeper', color: 'text-blue-400' },
    { id: 'network', icon: Network, label: 'Net Sentinel', color: 'text-emerald-400' },
    { id: 'color', icon: Palette, label: 'Color Alchemy', color: 'text-rose-400' },
    { id: 'debate', icon: BrainCircuit, label: 'Council', color: 'text-violet-400' }, // [NEW]
    { id: 'docs', icon: Database, label: 'DocuVault', color: 'text-amber-400' }, // [NEW]
    { id: 'artifacts', icon: Box, label: 'Artifacts', color: 'text-blue-400' }, // [NEW]
    { id: 'crypto', icon: Lock, label: 'Crypto Vault', color: 'text-red-400' },
    { id: 'diff', icon: Cpu, label: 'Diff Lens', color: 'text-indigo-400' }, // Using CPU for now
    { id: 'qr', icon: QrCode, label: 'QR Nexus', color: 'text-cyan-400' }, // [NEW]
    // Future apps...
];

const UtilityDock: React.FC<UtilityDockProps> = ({ activeApp, onLaunch }) => {
    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 flex items-end gap-2 shadow-2xl">
            {APPS.map((app) => (
                <DockItem 
                    key={app.id} 
                    app={app} 
                    isActive={activeApp === app.id} 
                    onClick={() => onLaunch(app.id as SolutionApp)} 
                />
            ))}
        </div>
    );
};

interface DockItemProps {
  app: {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const DockItem = ({ app, isActive, onClick }: DockItemProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div 
            className="relative flex flex-col items-center gap-1 group"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -10 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-8 px-2 py-1 bg-black/80 border border-white/10 rounded text-xs font-mono text-white whitespace-nowrap pointer-events-none"
                    >
                        {app.label}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Icon */}
            <motion.button
                layout
                animate={{ 
                    y: isHovered ? -10 : 0,
                    scale: isActive ? 1.2 : isHovered ? 1.2 : 1 
                }}
                className={`
                    w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-200
                    ${isActive 
                        ? 'bg-white/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                    }
                `}
            >
                <app.icon className={`w-6 h-6 ${app.color}`} />
            </motion.button>

            {/* Reflection/Dot */}
            {isActive && <div className="w-1 h-1 rounded-full bg-cyan-400" />}
        </motion.div>
    );
};

export default UtilityDock;
