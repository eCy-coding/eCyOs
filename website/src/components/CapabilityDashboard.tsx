
import { Brain, Database, Cpu, Activity } from "lucide-react";

export default function CapabilityDashboard() {
  const metrics = [
    { label: "Active Models (Router)", value: "412", icon: Brain, color: "text-cyan-400" },
    { label: "Memory Nodes (LGM)", value: "1,024", icon: Database, color: "text-purple-400" },
    { label: "System Load (Local)", value: "12%", icon: Cpu, color: "text-green-400" },
    { label: "Debate Coherence", value: "98.4%", icon: Activity, color: "text-yellow-400" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 w-full mb-4">
      {metrics.map((m, i) => (
        <div key={i} className="p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md flex items-center gap-4 hover:bg-white/5 transition-colors group">
          <div className={`p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${m.color}`}>
            <m.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
