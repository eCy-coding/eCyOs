import { useState, useEffect } from 'react';
import { Cpu, Server, Trash2, Download, RefreshCw } from 'lucide-react';

export default function ModelManager() {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pullModelName, setPullModelName] = useState("");

  const fetchModels = async () => {
    setIsLoading(true);
    try {
        // In a real implementation this would fetch from /api/local/models
        // Mocking for now as per e2e plan
        setModels(["llama3:latest", "mistral:latest", "phi3:mini"]); 
    } catch (e) {
        console.error("Failed to fetch models", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Local Cortex (NPU)
        </h3>
        <button 
            onClick={fetchModels} 
            className="p-1.5 rounded-md hover:bg-white/10 transition"
            disabled={isLoading}
        >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Model List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {models.map((model, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 text-xs group">
                <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-cyan-500/50" />
                    <div className="flex flex-col">
                        <span className="text-white font-mono font-medium">{model}</span>
                        <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                            ACTIVE • 4.2GB VRAM
                        </span>
                    </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        ))}
      </div>

       {/* Pull Model Input */}
       <div className="mt-2 pt-2 border-t border-white/5">
         <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Pull model (e.g. llama3)" 
                value={pullModelName}
                onChange={(e) => setPullModelName(e.target.value)}
                className="flex-1 bg-black/30 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 transition"
            />
            <button 
                className="px-3 py-1.5 rounded-md bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/20 transition text-xs font-medium flex items-center gap-2"
            >
                <Download className="w-3.5 h-3.5" />
                Pull
            </button>
         </div>
       </div>
    </div>
  );
}
