
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { SolutionApp } from './UtilityDock';

// App Configuration for the Graph
const APP_NODES: { id: SolutionApp; label: string; position: [number, number, number]; color: string }[] = [
    { id: 'calculator', label: 'Omni-Calc', position: [0, 0, 0], color: '#06b6d4' },
    { id: 'editor', label: 'Agentic Editor', position: [3, 1, 0], color: '#facc15' },
    { id: 'terminal', label: 'Terminal', position: [-3, 1, 0], color: '#4ade80' },
    { id: 'converter', label: 'Unit Conv', position: [0, 3, 0], color: '#c084fc' },
    { id: 'regex', label: 'Regex Lab', position: [0, -3, 0], color: '#f472b6' },
    { id: 'json', label: 'JSON Refiner', position: [2, 2, 2], color: '#fb923c' },
    { id: 'clock', label: 'Timekeeper', position: [-2, 2, 2], color: '#60a5fa' },
    { id: 'network', label: 'Net Sentinel', position: [2, -2, 2], color: '#34d399' },
    { id: 'color', label: 'Color Alchemy', position: [-2, -2, 2], color: '#fb7185' },
    { id: 'debate', label: 'The Council', position: [0, 0, 4], color: '#a78bfa' },
    { id: 'docs', label: 'DocuVault', position: [4, 0, 0], color: '#fbbf24' },
    { id: 'artifacts', label: 'Artifacts', position: [-4, 0, 0], color: '#60a5fa' },
    { id: 'crypto', label: 'Crypto Vault', position: [0, 4, 0], color: '#f87171' },
    { id: 'diff', label: 'Diff Lens', position: [0, -4, 0], color: '#818cf8' },
    { id: 'qr', label: 'QR Nexus', position: [0, 0, -4], color: '#22d3ee' },
];

const ConnectionLine = ({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) => {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    
    return (
        <Line 
            points={points}       // Array of points
            color={color}                   // Default
            lineWidth={1}                   // In pixels (default)
            dashed={false}                  // Default
            opacity={0.2}
            transparent
        />
    );
};

const AppNode = ({ node, onLaunch }: { node: typeof APP_NODES[0]; onLaunch: (app: SolutionApp) => void }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.005;
            meshRef.current.rotation.y += 0.005;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={node.position}>
                <mesh 
                    ref={meshRef}
                    onClick={() => onLaunch(node.id)}
                    onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
                >
                    <icosahedronGeometry args={[hovered ? 0.7 : 0.5, 1]} />
                    <meshPhysicalMaterial 
                        color={node.color} 
                        transparent 
                        opacity={0.6}
                        roughness={0}
                        metalness={0.8}
                        clearcoat={1}
                        emissive={node.color}
                        emissiveIntensity={hovered ? 0.8 : 0.2}
                    />
                </mesh>
                
                {/* Glow Halo */}
                <mesh scale={[1.2, 1.2, 1.2]}>
                     <sphereGeometry args={[0.5, 32, 32]} />
                     <meshBasicMaterial color={node.color} transparent opacity={0.1} />
                </mesh>

                <Html distanceFactor={10} position={[0, -1, 0]} transform>
                    <div className={`
                        px-2 py-1 bg-black/50 backdrop-blur-md rounded border border-white/20 
                        text-xs font-mono text-white transition-opacity duration-300
                        ${hovered ? 'opacity-100 scale-110' : 'opacity-60'}
                    `}>
                        {node.label}
                    </div>
                </Html>
            </group>
        </Float>
    );
};

export const MasterPortal: React.FC<{ onLaunch: (app: SolutionApp) => void }> = ({ onLaunch }) => {
    return (
        <div className="w-full h-full absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <color attach="background" args={['#000']} />
                
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="cyan" />
                
                {/* Environment */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                
                {/* Controls */}
                <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} />

                {/* Nodes */}
                <group>
                    {APP_NODES.map((node) => (
                        <React.Fragment key={node.id}>
                            <AppNode node={node} onLaunch={onLaunch} />
                            {/* Connect to center (Calculator) for layout logic, or just visually pleasing web */}
                             {node.id !== 'calculator' && (
                                <ConnectionLine start={node.position} end={[0,0,0]} color={node.color} />
                             )}
                        </React.Fragment>
                    ))}
                </group>
            </Canvas>
            
            {/* Overlay UI */}
             <div className="absolute bottom-4 right-4 pointer-events-none text-right">
                <h3 className="text-white/40 font-mono text-xs">MASTER ARCHTECT PORTAL</h3>
                <p className="text-white/20 font-mono text-[10px]">VISUALIZING 15 ACTIVE NEURAL NODES</p>
            </div>
        </div>
    );
};
