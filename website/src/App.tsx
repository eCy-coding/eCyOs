import { AnimatePresence, motion } from "framer-motion";
import SwarmVisualizer from "./components/SwarmVisualizer";
import AgenticEditor from "./components/AgenticEditor";
import ArtifactPanel from "./components/ArtifactPanel";
import KnowledgeGraph from "./components/KnowledgeGraph";
import CapabilityDashboard from "./components/CapabilityDashboard";
import DocumentationPortal from "./components/DocumentationPortal";
import LandingPage from "./components/LandingPage";
import VisionOverlay from "./components/VisionOverlay";
import VoiceCommand from "./components/VoiceCommand";
import EvolutionPanel from "./components/EvolutionPanel";
import ModelManager from "./components/ModelManager";
import CalculatorPage from "./pages/CalculatorPage";
import DebateConsole from "./pages/DebateConsole";
import { LiquidBackground } from "./components/LiquidBackground";
import { CommandPalette } from "./components/CommandPalette";
import { JSONRefiner } from "./components/utilities/JSONRefiner";
import { RegexLab } from "./components/utilities/RegexLab";
import { ColorAlchemy } from "./components/utilities/ColorAlchemy";
import { Base64Coder } from "./components/utilities/Base64Coder";
import { HashCalculator } from "./components/utilities/HashCalculator";
import { UnitConverter } from "./components/utilities/UnitConverter";
import { TimestampConverter } from "./components/utilities/TimestampConverter";
import { MarkdownPreview } from "./components/utilities/MarkdownPreview";
import { QRGenerator } from "./components/utilities/QRGenerator";
import { LoremIpsum } from "./components/utilities/LoremIpsum";
import { URLShortener } from "./components/utilities/URLShortener";
import { PasswordGenerator } from "./components/utilities/PasswordGenerator";
import { ImageCompressor } from "./components/utilities/ImageCompressor";
import { CSVJSONConverter } from "./components/utilities/CSVJSONConverter";
import { useState } from "react";
import { useBrainLink } from "./hooks/useBrainLink";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'workspace' | 'nexus' | 'docs' | 'tools' | 'calculator' | 'debate' | 'utilities'>('home');
  const { isConnected, thoughtStream, codeStream, telemetry, terminalLines } = useBrainLink();

  const handlePrompt = async (text: string) => {
    console.log("[VOICE] Handover to Brain:", text);
    try {
       await fetch('http://localhost:8000/api/prompt', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ prompt: text })
       });
    } catch (e) {
      console.error("Brain Connection Failed", e);
    }
  };

  const handleVisionUpload = async (file: File) => {
    console.log("[VISION] Uploading:", file.name);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch('http://localhost:8000/api/vision', {
        method: 'POST',
        body: formData
      });
    } catch (e) {
      console.error("Vision Upload Failed", e);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -10, filter: "blur(4px)" }
  };

  return (
    <CommandPalette>
      <div className="relative w-full h-screen bg-background overflow-hidden font-sans text-foreground flex flex-col">
      {/* Dynamic Liquid Background */}
      <LiquidBackground />

      {/* Global Vision Dropzone */}
      <VisionOverlay onUpload={handleVisionUpload} />
      
      {/* Global Voice Command */}
      <VoiceCommand onCommand={handlePrompt} />
      
      {/* Navbar (Hidden on Landing Page) */}
      <AnimatePresence>
        {activeTab !== 'home' && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-14 border-b border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] transition-colors duration-500 ${isConnected ? 'bg-green-500 shadow-green-500' : 'bg-red-500 shadow-red-500'}`} />
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 cursor-pointer hover:opacity-80 transition-opacity">
                eCy OS v1005.0
              </h1>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
              {(['workspace', 'nexus', 'tools', 'docs', 'calculator', 'debate', 'utilities'] as const).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-1 text-xs font-medium rounded-full transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-muted-foreground hover:text-white'}`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{tab.replace('workspace', 'Agentic Workspace').replace('nexus', 'Knowledge Nexus').replace('tools', 'Lab Tools').replace('calculator', 'Calculator').replace('debate', 'The Council').replace('utilities', 'Utilities')}</span>

                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className={`animate-pulse ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                ● SIGNAL: {isConnected ? 'STRONG' : 'SEARCHING...'}
              </span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 overflow-hidden relative ${activeTab !== 'home' ? 'p-4' : ''}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" className="w-full h-full" {...pageVariants}>
              <LandingPage onEnter={() => setActiveTab('workspace')} />
            </motion.div>
          )}

          {activeTab === 'workspace' && (
            <motion.div key="workspace" className="grid grid-cols-12 grid-rows-2 gap-4 h-full" {...pageVariants}>
              {/* Left: 3D Swarm */}
              <div className="col-span-4 row-span-2 relative rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                  <h2 className="text-sm font-semibold text-white/80">Neural Swarm</h2>
                </div>
                <ErrorBoundary
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6">
                        <div className="text-cyan-400 text-4xl mb-3">🌐</div>
                        <p className="text-gray-400 text-sm">
                          Neural Swarm Offline<br/>
                          <span className="text-xs text-gray-500">
                            (Backend not connected)
                          </span>
                        </p>
                      </div>
                    </div>
                  }
                >
                  <SwarmVisualizer />
                </ErrorBoundary>
              </div>

              {/* Top Right: Agentic Editor */}
              <div className="col-span-8 row-span-1">
                {/* Passing Real Code Stream */}
                <AgenticEditor 
                  language="python" 
                  initialCode={codeStream || "# Waiting for Brain transmission..."} 
                  readOnly={true} // It's a stream, not an editor for now
                />
              </div>

              {/* Bottom Right: Artifacts & Logs */}
              <div className="col-span-8 row-span-1 grid grid-cols-4 gap-4">
                <div className="col-span-1">
                   <ArtifactPanel terminalLines={terminalLines} />
                </div>
                <div className="col-span-1">
                   <EvolutionPanel />
                </div>
                <div className="col-span-1">
                   <ModelManager />
                </div>
                {/* Real-time Log */}
                <div className="col-span-1 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4 flex flex-col font-mono text-xs">
                  <h3 className="text-sm font-semibold text-white mb-2 flex justify-between">
                    <span>System Telemetry</span>
                    <span className="text-muted-foreground">{telemetry?.agents || 0} Agents Active</span>
                  </h3>
                  <div className="flex-1 space-y-1 text-muted-foreground overflow-hidden opacity-90 overflow-y-auto">
                     {thoughtStream.map((log, i) => (
                       <p key={i} className={`${log.includes('[THINK]') ? 'text-cyan-400' : log.includes('[WARN]') ? 'text-yellow-400' : 'text-gray-400'}`}>
                         {log}
                       </p>
                     ))}
                     {thoughtStream.length === 0 && <p className="animate-pulse">Initializing Neural Link...</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'nexus' && (
            <motion.div key="nexus" className="h-full flex flex-col gap-4" {...pageVariants}>
              <CapabilityDashboard />
              <div className="flex-1 relative border border-white/10 rounded-xl overflow-hidden bg-black/40">
                <KnowledgeGraph />
              </div>
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div key="docs" className="h-full w-full" {...pageVariants}>
              <DocumentationPortal />
            </motion.div>
          )}


          {/* Temporarily disabled until Calculator component is created */}
          {/* {activeTab === 'tools' && (
            <motion.div key="tools" className="h-full w-full flex items-center justify-center" {...pageVariants}>
              <div className="w-full max-w-5xl h-[80vh]">
                <Calculator demoMode={true} />
              </div>
            </motion.div>
          )} */}
          
          {activeTab === 'calculator' && (
            <motion.div key="calculator" className="h-full w-full" {...pageVariants}>
              <CalculatorPage />
            </motion.div>
          )}

          {activeTab === 'debate' && (
            <motion.div key="debate" className="h-full w-full" {...pageVariants}>
              <DebateConsole />
            </motion.div>
          )}
          
          {activeTab === 'utilities' && (
            <motion.div key="utilities" className="h-full w-full flex flex-col gap-4" {...pageVariants}>
              <div className="grid grid-cols-4 gap-4 h-full auto-rows-fr">
                <JSONRefiner />
                <RegexLab />
                <ColorAlchemy />
                <Base64Coder />
                <HashCalculator />
                <UnitConverter />
                <TimestampConverter />
                <MarkdownPreview />
                <QRGenerator />
                <LoremIpsum />
                <URLShortener />
                <PasswordGenerator />
                <ImageCompressor />
                <CSVJSONConverter />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </CommandPalette>
  );
}

