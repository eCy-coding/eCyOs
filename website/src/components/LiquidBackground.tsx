import { motion } from "framer-motion";

export function LiquidBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[hsl(var(--background))]">
       {/* Deep Space Base */}
       <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-indigo-950 opacity-80" />

       {/* Moving Liquid Blobs */}
       <motion.div
         animate={{
           x: [0, 100, -50, 0],
           y: [0, -50, 50, 0],
           scale: [1, 1.2, 0.9, 1],
         }}
         transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
         className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px]"
       />

       <motion.div
         animate={{
           x: [0, -80, 40, 0],
           y: [0, 60, -30, 0],
           scale: [1, 1.1, 0.8, 1],
         }}
         transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
         className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/20 rounded-full blur-[140px]"
       />
       
       <motion.div
          animate={{
            x: [0, 50, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] left-[30%] w-[30vw] h-[30vw] bg-blue-500/10 rounded-full blur-[100px]"
       />

       {/* Mesh Grid Overlay */}
       <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
    </div>
  );
}
