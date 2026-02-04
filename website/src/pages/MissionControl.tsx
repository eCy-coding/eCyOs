
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Text, Stars, OrbitControls } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import OrchestratorPanel from "../components/OrchestratorPanel";
import { LiquidBackground } from "../components/LiquidBackground";
import { Brain, Cpu } from "lucide-react";

// 3D Node Component
interface SystemNodeProps {
  position: [number, number, number];
  label: string;
  color: string;
}

const SystemNode = ({ position, label, color }: SystemNodeProps) => {
  const [hovered, setHover] = useState(false);
  
  return (
    <RigidBody position={position} colliders="cuboid" restitution={0.8}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh 
          onPointerOver={() => setHover(true)} 
          onPointerOut={() => setHover(false)}
        >
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial 
            color={hovered ? "#00ffff" : color} 
            transparent 
            opacity={0.8} 
            emissive={color}
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, 0, 0.8]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Float>
    </RigidBody>
  );
};

const MissionControl: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      {/* Background Layer */}
      <LiquidBackground />
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10 opacity-60">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Physics gravity={[0, 0, 0]}>
            <SystemNode position={[-3, 2, 0]} label="SWARM" color="#ff00ff" />
            <SystemNode position={[3, 2, 0]} label="SCRIBE" color="#ffff00" />
            <SystemNode position={[0, -2, 0]} label="EXECUTOR" color="#00ff00" />
            <SystemNode position={[0, 2, -2]} label="CORE" color="#00ffff" />
            
            {/* Invisible boundaries to keep nodes in view */}
            <CuboidCollider position={[0, -6, 0]} args={[10, 1, 10]} />
            <CuboidCollider position={[0, 6, 0]} args={[10, 1, 10]} />
            <CuboidCollider position={[-8, 0, 0]} args={[1, 10, 10]} />
            <CuboidCollider position={[8, 0, 0]} args={[1, 10, 10]} />
          </Physics>
          
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-20 flex flex-col p-8 pointer-events-none">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pointer-events-auto">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600">
                    ANTIGRAVITY <span className="text-white text-base font-normal opacity-50 block">Mission Control v1037.0</span>
                </h1>
            </div>
            
            <div className="flex gap-4">
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono">CPU: 12%</span>
                </div>
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono">AI: 400+ Active</span>
                </div>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex gap-8 pointer-events-auto">
            
            {/* Left Column: System Status */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="glass-card p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Neural Activity</h2>
                    <div className="h-32 flex items-end gap-1">
                        {[...Array(20)].map((_, i) => (
                            <div 
                                key={i} 
                                className="bg-cyan-500/50 w-full rounded-t-sm transition-all duration-300"
                                style={{ height: "50%" }} 
                            />
                        ))}
                    </div>
                </div>
                
                <div className="glass-card p-6 rounded-2xl border border-white/10 backdrop-blur-md flex-1">
                     <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Active Agents</h2>
                     <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            Scribe (Docs)
                        </li>
                        <li className="flex items-center gap-3 text-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-75"></span>
                            Swarm (Debate)
                        </li>
                        <li className="flex items-center gap-3 text-sm">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-150"></span>
                            Planner (Arch)
                        </li>
                     </ul>
                </div>
            </div>

            {/* Right Column: Orchestrator */}
            <div className="w-2/3 flex items-center justify-center">
                <OrchestratorPanel />
            </div>

        </main>
      </div>
    </div>
  );
};

export default MissionControl;
