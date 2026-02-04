// Physics Worker: Handles Neural Swarm calculations and rendering
// to keep the main thread unblocked.

interface PhysicsNode {
    id: number;
    x: number;
    y: number;
    label: string;
    color: string;
}

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let nodes: PhysicsNode[] = [];
let time = 0;
let animationFrameId: number;

self.onmessage = (evt) => {
    const { type, payload } = evt.data;

    if (type === 'INIT') {
        canvas = payload.canvas;
        width = payload.width;
        height = payload.height;
        nodes = payload.nodes;
        
        if (canvas) {
            ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
            startLoop();
        }
    }

    if (type === 'RESIZE') {
        width = payload.width;
        height = payload.height;
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
        }
    }

    if (type === 'UPDATE_NODES') {
        nodes = payload.nodes;
    }
};

function render() {
    if (!ctx || !width || !height) return;

    time += 0.02;
    ctx.clearRect(0, 0, width, height);

    // Dynamic Background Pulse (Subtle)
    const pulse = Math.sin(time * 0.5) * 0.05 + 0.05;
    ctx.fillStyle = `rgba(0, 243, 255, ${pulse})`;
    ctx.fillRect(0, 0, width, height);
    ctx.clearRect(1, 1, width - 2, height - 2); // Border effect

    // Draw Connections
    ctx.lineWidth = 1.5;
    nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
            if (i < j) {
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 300) {
                    ctx!.beginPath();
                    const opacity = (Math.sin(time + i + j) + 1) / 4 + 0.05;
                    ctx!.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx!.moveTo(node.x, node.y);
                    ctx!.lineTo(otherNode.x, otherNode.y);
                    ctx!.stroke();
                }
            }
        });
    });

    // Draw Nodes
    nodes.forEach(node => {
        // Orbital motion
        const orbitX = node.x + Math.sin(time + node.id) * 5;
        const orbitY = node.y + Math.cos(time + node.id) * 5;

        ctx!.beginPath();
        ctx!.arc(orbitX, orbitY, 6, 0, Math.PI * 2);
        ctx!.fillStyle = node.color;
        ctx!.shadowBlur = 15;
        ctx!.shadowColor = node.color;
        ctx!.fill();
        ctx!.shadowBlur = 0;

        // Label
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx!.font = '10px monospace';
        ctx!.fillText(node.label, orbitX - 20, orbitY - 12);
    });

    // Particle Stream
    const px = 150 + (Math.sin(time * 0.8) + 1) * 150;
    const py = 150 + (Math.cos(time * 1.2)) * 40;
    ctx!.beginPath();
    ctx!.arc(px, py, 3, 0, Math.PI * 2);
    ctx!.fillStyle = '#ffffff';
    ctx!.shadowBlur = 10;
    ctx!.shadowColor = '#fff';
    ctx!.fill();

    animationFrameId = requestAnimationFrame(render);
}

function startLoop() {
    if (!animationFrameId) {
        render();
    }
}
