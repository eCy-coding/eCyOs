import { forceSimulation, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum } from 'd3-force';

// Define strict types for worker messages
type WorkerMessage = 
  | { type: 'INIT'; agentCount: number }
  | { type: 'UPDATE_TARGET'; target: { x: number; y: number; z: number } | null }
  | { type: 'TICK' };

interface SimulationNode extends SimulationNodeDatum {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}


let simulation: any;
let nodes: SimulationNode[] = [];

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;

  if (type === 'INIT') {
    const { agentCount } = e.data as any;
    
    // Initialize nodes
    nodes = Array.from({ length: agentCount }, (_, i) => ({
      index: i,
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      vx: 0,
      vy: 0,
      vz: 0
    }));

    // Setup Force Simulation
    simulation = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-5)) // Repulsion
      .force('center', forceCenter(0, 0)) // Gravity to center
      .force('collide', forceCollide().radius(0.2).iterations(1))
      .stop(); // We will tick manually
      
    console.log('[NeuralWorker] Visual cortex initialized with', agentCount, 'neurons');
  }

  if (type === 'TICK') {
    if (!simulation) return;
    
    simulation.tick();
    
    // Prepare buffer to send back (Float32Array is transferrable and fast)
    // Layout: [x, y, z, ...next node]
    const positions = new Float32Array(nodes.length * 3);
    
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Update Z manually (simple harmonic drift + attraction to center Z)
        // This adds "lifelike" 3D movement without full 3D physics engine overhead
        node.z += (Math.random() - 0.5) * 0.1 - node.z * 0.01; 
        
        positions[i * 3 + 0] = node.x;
        positions[i * 3 + 1] = node.y;
        positions[i * 3 + 2] = node.z;
    }
    
    self.postMessage({ type: 'UPDATE', positions }, [positions.buffer] as any);
  }
};
