import { motion } from 'framer-motion';

// Bento Grid component showcasing glassmorphism cards
export default function BentoGrid() {
  const cards = [
    { title: 'Neural Swarm', description: 'Visualize multi‑agent dynamics' },
    { title: 'Knowledge Nexus', description: 'Explore semantic graph' },
    { title: 'Agentic Editor', description: 'Live code streaming' },
    { title: 'Telemetry', description: 'Real‑time system metrics' },
    { title: 'Showcase', description: 'Demo mode with glass UI' },
    { title: 'Vision', description: 'Image analysis & VLM' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative rounded-xl bg-black/30 backdrop-blur-xl border border-white/10 p-4 hover:shadow-xl transition-shadow"
        >
          <h3 className="text-lg font-semibold text-white mb-2">{c.title}</h3>
          <p className="text-sm text-muted-foreground">{c.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
