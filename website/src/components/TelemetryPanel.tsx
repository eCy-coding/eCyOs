import { Activity, Cpu, Wifi } from 'lucide-react';

// Simple Telemetry Panel placeholder for Phase 20 UI
export default function TelemetryPanel() {
  return (
    <div className="p-4 rounded-xl bg-black/30 backdrop-blur-xl border border-white/10 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Telemetry</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Cpu className="w-3 h-3" /> CPU</span>
            <span className="text-lg font-mono text-white">12%</span>
        </div>
        <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Wifi className="w-3 h-3" /> Net</span>
            <span className="text-lg font-mono text-white">45ms</span>
        </div>
      </div>
    </div>
  );
}
