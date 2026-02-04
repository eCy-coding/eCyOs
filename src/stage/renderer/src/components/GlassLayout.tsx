import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassLayoutProps {
  children: ReactNode;
  className?: string;
}

const GlassLayout: React.FC<GlassLayoutProps> = ({ children, className }) => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-violet-500/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[128px]" />
        <div className="absolute inset-0 holo-grid opacity-20 pointer-events-none" />
      </div>

      {/* Main Glass Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "relative z-10 w-full h-full flex flex-col",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const GlassPanel: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <motion.div
      whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
      className={cn(
        "liquid-glass rounded-2xl p-6 transition-colors duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassLayout;
