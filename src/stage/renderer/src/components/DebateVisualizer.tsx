import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Agent Node Component
const AgentNode = ({ position, color, role, label }: { position: [number, number, number], color: string, role: string, label: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} wireframe />
      </mesh>
      <Text position={[position[0], position[1] - 1.2, position[2]]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        {role}
      </Text>
      <Text position={[position[0], position[1] - 1.5, position[2]]} fontSize={0.2} color="#94a3b8" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </Float>
  );
};

// Particle Connection Lines
const Connections = () => {
    // Static lines for demo
    const points = [
        new THREE.Vector3(-3, 0, 0),
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(3, 0, 0),
        new THREE.Vector3(0, -2, 0),
        new THREE.Vector3(-3, 0, 0)
    ]
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    return (
        <line geometry={lineGeometry}>
            <lineBasicMaterial attach="material" color="#475569" transparent opacity={0.3} />
        </line>
    )
}

const DebateVisualizer: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50 border border-white/5 relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Council of Wisdom</h3>
        <p className="text-xs text-slate-500">Real-time Agent Interaction Graph</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Agent Nodes */}
        <AgentNode position={[-3, 0, 0]} color="#ef4444" role="CRITIC" label="Claude 3.5 Sonnet" />
        <AgentNode position={[0, 2, 0]} color="#8b5cf6" role="JUDGE" label="Gemini 1.5 Pro" />
        <AgentNode position={[3, 0, 0]} color="#10b981" role="PROPOSER" label="GPT-4o" />
        <AgentNode position={[0, -2, 0]} color="#f59e0b" role="EXECUTOR" label="DeepSeek Coder" />
        
        <Connections />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default DebateVisualizer;
