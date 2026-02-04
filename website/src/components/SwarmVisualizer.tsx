import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useBrainLink } from '../hooks/useBrainLink';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const SwarmVisualizer: React.FC = () => {
  const { thoughtStream } = useBrainLink();
  const agentCount = 1000;
  
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useRef(new THREE.Object3D());
  const workerRef = useRef<Worker | null>(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/neural.worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.postMessage({ type: 'INIT', agentCount });

    workerRef.current.onmessage = (e) => {
      const { type, positions } = e.data;
      
      if (type === 'UPDATE' && meshRef.current) {
        const posArray = new Float32Array(positions);
        
        for (let i = 0; i < agentCount; i++) {
            const x = posArray[i * 3 + 0];
            const y = posArray[i * 3 + 1];
            const z = posArray[i * 3 + 2];

            tempObject.current.position.set(x, y, z);
            tempObject.current.scale.setScalar(1); // Scale logic can be moved to shader or simple reactive state if needed
            tempObject.current.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.current.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [agentCount]);

  // Update gravity center based on thoughts
  useEffect(() => {
    if (workerRef.current && thoughtStream.length > 0) {
      // Simulate gravity shift based on activity
      workerRef.current.postMessage({ 
        type: 'UPDATE_TARGET', 
        target: { x: Math.random(), y: Math.random(), z: Math.random() } 
      });
    }
  }, [thoughtStream.length]);

  // Tick Worker Loop
  useFrame(() => {
    workerRef.current?.postMessage({ type: 'TICK' });
  });

  return (
    <group>
      <EffectComposer>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
      </EffectComposer>

      {/* Central Core */}
      <Sphere args={[1, 32, 32]}>
         <meshStandardMaterial 
            color="#7000ff" 
            emissive="#a855f7"
            emissiveIntensity={2} 
            toneMapped={false} 
            roughness={0.2}
            metalness={0.8}
         />
      </Sphere>
      
      {/* The Swarm (Instanced) */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, agentCount]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
            toneMapped={false} 
            roughness={0.4} 
            metalness={0.6} 
            emissive="#00f0ff"
            emissiveIntensity={0.5}
        />
      </instancedMesh>
    </group>
  );
};

export default SwarmVisualizer;
