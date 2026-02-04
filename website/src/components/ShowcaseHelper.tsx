import { motion } from 'framer-motion';
import { Info, Lightbulb, Zap } from 'lucide-react';

interface ShowcaseHelperProps {
  step: number;
}

export default function ShowcaseHelper({ step }: ShowcaseHelperProps) {
  const tips = [
    {
      icon: <Zap className="text-yellow-400" />,
      text: "eCy OS uses a 'Proposer-Critic-Judge' consensus model for high-fidelity outputs."
    },
    {
      icon: <Lightbulb className="text-cyan-400" />,
      text: "The Brain connects to 400+ models via OpenRouter, selecting the best Expert for each task."
    },
    {
      icon: <Info className="text-purple-400" />,
      text: "All memories are crystalized in Supabase and visualized here in the Knowledge Nexus."
    }
  ];

  const activeTip = tips[step % tips.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={step}
      className="absolute bottom-8 right-8 max-w-sm"
    >
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-start gap-3 shadow-2xl">
        <div className="mt-1 p-1 bg-white/5 rounded-full">
          {activeTip.icon}
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">System Insight</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {activeTip.text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
