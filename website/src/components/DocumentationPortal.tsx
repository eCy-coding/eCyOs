import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Search, Sparkles, BookOpen, Clock, ArrowRight } from "lucide-react";
import MetricsChart from "./MetricsChart";

const markdownContent = `
# eCy OS Documentation Portal

Welcome to the **eCy OS** documentation portal. This portal provides:

- **Interactive API** documentation (generated via Typedoc).
- **System metrics** visualizations.
- **Live walkthroughs** and changelogs.
- **Mermaid diagrams** for architecture overview.

## Recent Updates
- [x] **Phase 10:** Active Artifacts with embedded Calculators.
- [x] **Phase 9:** Quantum Calculator Integration.
`;

export default function DocumentationPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setAiResponse(null);

    // Simulate Vector Search / AI Processing
    setTimeout(() => {
        setIsSearching(false);
        setAiResponse(`
**Analysis of "${searchQuery}"**:

Based on the **Knowledge Graph** (Vector DB), here is the relevant context:
1.  **System Core**: Validated in Phase 1.
2.  **Quantum State**: Stable at 98.4% coherence.

*Suggestion*: Check \`src/ecy/quantum/core.py\` for implementation details.
        `);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
      
      {/* Search Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="relative z-10 space-y-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-cyan-400" />
                Documentation Portal
            </h1>
            <p className="text-gray-400 max-w-2xl">
                Access the collective intelligence of the eCy OS. Ask questions, explore API references, and visualize system metrics in real-time.
            </p>

            {/* AI Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl relative group">
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center p-1 pl-4 transition-all focus-within:border-white/20 focus-within:bg-black/80">
                    <Search className={`w-5 h-5 text-gray-400 mr-3 ${isSearching ? 'animate-pulse text-cyan-400' : ''}`} />
                    <input 
                        type="text" 
                        placeholder="Ask the Master Architect..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm h-10"
                    />
                    <button 
                        type="submit"
                        disabled={isSearching}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isSearching ? <Sparkles className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            </form>

            {/* AI Response Card */}
            {aiResponse && (
                <div className="max-w-xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
                        <div className="flex items-center gap-2 mb-2">
                             <Sparkles className="w-4 h-4 text-cyan-400" />
                             <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">AI Insight</span>
                        </div>
                        <div className="prose prose-invert prose-sm">
                            <ReactMarkdown>{aiResponse}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
                </div>
            </section>
          </div>

          {/* Sidebar Metrics */}
          <div className="space-y-6">
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                 <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" /> System Health
                 </h3>
                 <MetricsChart />
            </div>
            
            <div className="bg-linear-to-br from-purple-900/20 to-black rounded-xl border border-white/10 p-4">
                 <h3 className="text-sm font-semibold text-white mb-2">Quick Links</h3>
                 <ul className="space-y-2 text-xs text-gray-400">
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">→ API Reference (v1008)</li>
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">→ Architecture Diagrams</li>
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">→ Contribution Guidelines</li>
                 </ul>
            </div>
          </div>
      </div>
    </div>
  );
}
