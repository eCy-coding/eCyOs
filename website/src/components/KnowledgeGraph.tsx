
import React, { useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useResizeDetector } from 'react-resize-detector';
// import SpriteText from 'three-spritetext'; // Optional for text labels

// Mock Data for Phase 6 (Will be replaced by real RAG data later)
const MOCK_DATA = {
  nodes: [
    { id: 'App.tsx', group: 1, val: 20 },
    { id: 'AgenticEditor.tsx', group: 2, val: 15 },
    { id: 'LogicEngine.tsx', group: 2, val: 10 },
    { id: 'useBrainLink.ts', group: 3, val: 5 },
    { id: 'main.py', group: 4, val: 30 },
    { id: 'healer.py', group: 4, val: 10 },
    { id: 'calc.py', group: 4, val: 5 },
  ],
  links: [
    { source: 'App.tsx', target: 'AgenticEditor.tsx' },
    { source: 'App.tsx', target: 'LogicEngine.tsx' },
    { source: 'App.tsx', target: 'useBrainLink.ts' },
    { source: 'main.py', target: 'healer.py' },
    { source: 'main.py', target: 'calc.py' },
    { source: 'AgenticEditor.tsx', target: 'useBrainLink.ts' }, // Shared logic
  ]
};

const KnowledgeGraph: React.FC = () => {
  const { width, height, ref } = useResizeDetector();
  const fgRef = useRef<any>(null);

  return (
    <div ref={ref} className="w-full h-full bg-black/0 relative overflow-hidden">
      {width && height && (
        <ForceGraph3D
          ref={fgRef}
          width={width}
          height={height}
          graphData={MOCK_DATA}
          backgroundColor="rgba(0,0,0,0)" // Transparent
          nodeLabel="id"
          nodeColor={(node: { id: string; group: number; val: number }) => {
              // Custom colors based on file extension/group
              if (node.group === 1) return '#ffffff'; // Core
              if (node.group === 2) return '#00ffff'; // React
              if (node.group === 3) return '#ff79c6'; // Hooks
              return '#bd93f9'; // Python
          }}
          linkColor={() => 'rgba(255,255,255,0.1)'}
          nodeRelSize={4}
          enableNodeDrag={false}
          showNavInfo={false}
          
          // Cool effects
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleWidth={1}
          linkDirectionalParticleColor={() => '#00ffff'}
        />
      )}
      
      <div className="absolute bottom-4 left-4 p-2 bg-black/60 rounded border border-white/5 backdrop-blur text-[10px] text-white/50 font-mono">
        <div>● REACT</div>
        <div className="text-cyan-400">● COMPONENT</div>
        <div className="text-purple-400">● PYTHON</div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
