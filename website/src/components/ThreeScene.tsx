
import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Mesh } from 'three';

// Simple rotating brain-like geometry (placeholder)
function RotatingBrain() {
  const meshRef = useRef<Mesh>(null);
  useEffect(() => {
    const id = requestAnimationFrame(function animate() {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x += 0.002;
      }
      requestAnimationFrame(animate);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <mesh ref={meshRef} scale={1.5}>
      <torusKnotGeometry args={[1, 0.4, 100, 16]} />
      <meshStandardMaterial color="#00ffff" emissive="#0044ff" metalness={0.6} roughness={0.2} />
    </mesh>
  );
}

export default function ThreeScene() {
  return (
    <div className="w-full h-96 bg-black/30 backdrop-blur-md rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <RotatingBrain />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
