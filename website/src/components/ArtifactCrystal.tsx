
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, MeshTransmissionMaterial } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';

interface ArtifactCrystalProps {
  position: [number, number, number];
  title: string;
  type: 'plan' | 'report' | 'code';
  onClick?: () => void;
}

export default function ArtifactCrystal({ position, title, type, onClick }: ArtifactCrystalProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Color mapping based on artifact type
  const colorMap = {
    plan: "#00f3ff",  // Cyan
    report: "#bc13fe", // Magenta
    code: "#10b981",   // Green
  };

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      meshRef.current.rotation.y += 0.01;
      
      // Expand on hover
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh 
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          {/* Crystal Shape (Octahedron for futuristic look) */}
          <octahedronGeometry args={[0.5, 0]} />
          
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={0.2} // Glass thickness
            roughness={0.1}
            chromaticAberration={0.5}
            anisotropy={0.1}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            color={colorMap[type] || "#ffffff"}
            toneMapped={true}
          />
        </mesh>

        {/* Floating Label */}
        {hovered && (
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="/fonts/JetBrainsMono-Bold.ttf" // Providing a default font fallback or rely on system
          >
            {title}
          </Text>
        )}
      </Float>
    </group>
  );
}
