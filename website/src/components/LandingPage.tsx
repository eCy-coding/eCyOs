
import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import SwarmVisualizer from './SwarmVisualizer';
import ArtifactGallery from './ArtifactGallery';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

interface LandingPageProps {
  onEnter?: () => void;
}

// ---- 3D Components for the Warp Effect ----

const CameraController = ({ isWarping, onWarpComplete }: { isWarping: boolean; onWarpComplete: () => void }) => {
  const { camera } = useThree();
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    if (isWarping) {
        // Accelerate camera into the swarm (Negative Z)
        camera.position.lerp(vec.set(0, 0, -50), delta * 2);
        
        // FOV "Star Wars" Warp Effect
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, 120, delta * 3);
            camera.updateProjectionMatrix();
        }

        // Trigger completion when close enough
        if (camera.position.z < -10) {
            onWarpComplete();
        }
    } else {
        // Idle gentle float
        state.camera.position.lerp(vec.set(state.pointer.x * 2, state.pointer.y * 2, 8), delta * 0.5);
        state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

const WarpStars = ({ isWarping }: { isWarping: boolean }) => {
    const starRef = useRef<any>(null);
    useFrame((_state, delta) => {
        if (starRef.current) {
            // Spin stars faster during warp to simulate speed lines
            starRef.current.rotation.z += delta * (isWarping ? 5 : 0.05);
            // Elongate stars? (Requires shader, simple rotation is a good proxy for now)
        }
    });

    return (
        <group ref={starRef}>
             <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}


// ---- Main Component ----

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isWarping, setIsWarping] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Parallax / Scroll Transforms
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  const yFeature1 = useTransform(scrollYProgress, [0.1, 0.4], [100, 0]);
  const opacityFeature1 = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  const yFeature2 = useTransform(scrollYProgress, [0.3, 0.6], [100, 0]);
  const opacityFeature2 = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);

  const handleEnter = () => {
      setIsWarping(true);
      // Wait for animation to finish before calling parent onEnter (handled by CameraController)
  };

  return (
    <div className="relative min-h-[300vh] bg-black text-white font-sans"> 
      {/* 3D Background (Fixed) */}
      <div className="fixed inset-0 z-0">
        <Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
           <CameraController isWarping={isWarping} onWarpComplete={onEnter || (() => {})} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <Suspense fallback={null}>
             <WarpStars isWarping={isWarping} />
             <SwarmVisualizer />
             <Environment preset="city" />
          </Suspense>
          {/* <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} /> */}
        </Canvas>
      </div>

      {/* Scrollytelling Content Overlay */}
      <div className="relative z-10 flex flex-col items-center w-full">
        
        {/* Section 1: Hero */}
        <motion.section 
            style={{ y: yHero, opacity: opacityHero }}
            className="h-screen flex flex-col items-center justify-center text-center px-4"
        >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-gray-500 mb-6 drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                ANTIGRAVITY
            </h1>
            <p className="text-xl md:text-2xl text-cyan-400 font-mono tracking-[0.3em] uppercase mb-12">
                eCy OS v1005.0 // THE OMNI-INTELLIGENCE
            </p>
            
            <button 
                onClick={handleEnter}
                disabled={isWarping}
                className="group relative px-10 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-full overflow-hidden transition-all hover:scale-105 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(0,240,255,0.4)]"
            >
                <span className="relative z-10 text-sm font-bold tracking-[0.2em] group-hover:text-cyan-300 transition-colors">
                    {isWarping ? 'WARP ENGAGED...' : 'INITIALIZE SYSTEM'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
            
            <div className="absolute bottom-10 animate-bounce text-white/30 text-xs font-mono">
                SCROLL TO EXPLORE
            </div>
        </motion.section>

        {/* Section 2: The Swarm */}
        <motion.section 
            style={{ y: yFeature1, opacity: opacityFeature1 }}
            className="h-screen flex flex-col md:flex-row items-center justify-center max-w-6xl mx-auto px-6 gap-12"
        >
             <div className="flex-1 text-left glass-panel p-8 rounded-2xl bg-black/40 border border-white/10">
                <h2 className="text-4xl font-bold mb-4 text-purple-400">01. The Neural Manifesto.</h2>
                <div className="text-lg text-gray-400 leading-relaxed font-light space-y-4">
                    <p>
                        We are architects of the <strong>AGI Era</strong>. 
                        eCy OS is not merely a dashboard; it is a living, breathing neural network where every tool is an autonomous agent.
                    </p>
                    <p>
                        From the <em>Omni-Calculator</em> to the <em>Debate Council</em>, every interaction feeds the collective intelligence. 
                        Welcome to the future of Human-AI Symbiosis.
                    </p>
                </div>
                <div className="mt-6 flex gap-2">
                    <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 text-xs border border-purple-500/40">Autonomous Agents</span>
                    <span className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/40">Liquid Interface</span>
                    <span className="px-3 py-1 rounded bg-green-500/20 text-green-300 text-xs border border-green-500/40">Self-Healing Core</span>
                </div>
             </div>
             <div className="flex-1 h-64 md:h-96 w-full rounded-2xl overflow-hidden border border-white/10 relative group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7f1c338e44a0?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                 <div className="absolute bottom-4 left-4 text-xs font-mono text-purple-400">
                     FIG 01: NEURAL ARCHITECTURE
                 </div>
             </div>
        </motion.section>

        {/* Section 3: The Artifacts */}
        <motion.section 
             style={{ y: yFeature2, opacity: opacityFeature2 }}
             className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-20"
        >
             <div className="w-full max-w-7xl glass-panel p-8 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
                
                <h2 className="text-3xl font-bold mb-8 text-center">
                    <span className="text-white">SYSTEM ARTIFACTS</span>
                </h2>
                <ArtifactGallery />
             </div>

              <div className="mt-20">
                 <button 
                    onClick={handleEnter}
                    className="text-white/50 hover:text-white transition-colors text-sm font-mono tracking-widest uppercase border-b border-transparent hover:border-cyan-500"
                 >
                    [ READY FOR DEPLOYMENT? ENTER NOW ]
                 </button>
             </div>
        </motion.section>
      </div>
    </div>
  );
};

export default LandingPage;
