
import { Code, Shield, Layers } from "lucide-react";

export default function Docs() {
  return (
    <div className="h-full w-full overflow-y-auto px-20 py-10 bg-black/80">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500">
            eCy OS v1007.0 Manual
          </h1>
          <p className="text-xl text-muted-foreground">
            The Official Guide to the Omni-Intelligence System
          </p>
        </div>

        {/* Section 1: Introduction */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-2">
            <Layers className="text-cyan-400" />
            <h2 className="text-2xl font-semibold text-white">System Architecture</h2>
          </div>
          <p className="text-gray-400 leading-relaxed">
            eCy OS is a hybrid intelligence system integrating a <strong>Python-based Brain</strong> (Reasoning),
            <strong>Supabase Memory</strong> (Persistence), and a <strong>Liquid Glass Portal</strong> (Visualization).
            It operates on a "Proposer-Critic-Judge" swarm architecture to ensure high-fidelity outputs.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-cyan-300 font-mono mb-2">Brain (Core)</h3>
              <p className="text-xs text-gray-500">Orchestrates LLM debates and executes actions via Terminal.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-purple-300 font-mono mb-2">Nexus (Memory)</h3>
              <p className="text-xs text-gray-500">4D Knowledge Graph storing all artifacts and semantic links.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-green-300 font-mono mb-2">Portal (UI)</h3>
              <p className="text-xs text-gray-500">React-based Agentic Workspace for real-time collaboration.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Usage */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-2">
            <Code className="text-purple-400" />
            <h2 className="text-2xl font-semibold text-white">Command Reference</h2>
          </div>
          <div className="space-y-2">
            <div className="p-4 rounded-lg bg-black border border-white/10 font-mono text-sm">
              <span className="text-cyan-400">$</span> ecy start
              <p className="text-gray-500 mt-1 pl-4"># Launches the interactive terminal session.</p>
            </div>
            <div className="p-4 rounded-lg bg-black border border-white/10 font-mono text-sm">
              <span className="text-cyan-400">$</span> ecy think "Query"
              <p className="text-gray-500 mt-1 pl-4"># Initiates a multi-agent debate on the query.</p>
            </div>
            <div className="p-4 rounded-lg bg-black border border-white/10 font-mono text-sm">
              <span className="text-cyan-400">$</span> ecy portal
              <p className="text-gray-500 mt-1 pl-4"># Opens this web interface (Liquid Glass UI).</p>
            </div>
          </div>
        </section>

        {/* Section 3: Safety */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-2">
            <Shield className="text-red-400" />
            <h2 className="text-2xl font-semibold text-white">Healer Protocol</h2>
          </div>
          <p className="text-gray-400 leading-relaxed">
            The system is equipped with an autonomous <strong>Healer</strong> module. If a Python exception or build error occurs,
            the Healer analyzes the stack trace, consults the Brain, and applies a patch automatically.
            Check <code>system_logs</code> in Supabase for repair history.
          </p>
        </section>

        <footer className="pt-12 text-center text-xs text-gray-600">
          eCy OS v1007.0 • MIT License • Built by Master Architect
        </footer>

      </div>
    </div>
  );
}
