import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function PhysicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 300,
        height: 200,
        background: 'transparent',
        wireframes: false,
      },
    });

    // Add some bodies
    const circle = Matter.Bodies.circle(150, 100, 30, {
      render: { fillStyle: '#00ffcc' },
    });
    const box = Matter.Bodies.rectangle(200, 50, 40, 40, {
      render: { fillStyle: '#ff6600' },
    });
    const ground = Matter.Bodies.rectangle(150, 190, 300, 20, { isStatic: true, render: { fillStyle: '#444' } });
    Matter.World.add(engine.world, [circle, box, ground]);

    Matter.Engine.run(engine);
    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div className="w-full flex justify-center mt-6">
      <canvas ref={canvasRef} className="rounded-xl bg-black/30 backdrop-blur-md" />
    </div>
  );
}
