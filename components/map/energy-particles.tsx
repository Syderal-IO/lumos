"use client";

import { useEffect, useRef } from "react";

/**
 * #12 Energy Particles — Canvas overlay showing energy transfer particles.
 * Fires particles that travel from left to right with a glowing trail.
 */
export default function EnergyParticles({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; color: string; size: number;
    }

    const particles: Particle[] = [];
    const colors = ["#F97316", "#FBBF24", "#22C55E", "#10B981"];

    const spawn = () => {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: Math.random() * canvas.width * 0.3,
          y: Math.random() * canvas.height,
          vx: 1 + Math.random() * 3,
          vy: (Math.random() - 0.5) * 1.5,
          life: 0,
          maxLife: 60 + Math.random() * 60,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
        });
      }
    };

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 10 === 0) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const alpha = 1 - p.life / p.maxLife;

        if (p.life > p.maxLife || p.x > canvas.width) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      }

      frame++;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10, opacity: 0.6 }}
    />
  );
}
