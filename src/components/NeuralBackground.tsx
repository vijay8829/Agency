"use client";
import { useEffect, useRef } from "react";

interface Particle { x: number; y: number; vx: number; vy: number; r: number; a: number; }

export function NeuralBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const N = 48;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        r: Math.random() * 1.6 + 0.5,
        a: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      /* In light mode: subtle navy-blue particles on white; dark mode: cyan particles */
      const cR = isLight ? 0   : 0;
      const cG = isLight ? 100 : 212;
      const cB = isLight ? 180 : 255;
      const baseOpacity = isLight ? 0.18 : 0.45;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* connections */
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * (isLight ? 0.10 : 0.18);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${cR},${cG},${cB},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      /* nodes */
      particles.forEach(p => {
        p.a += 0.012;
        const pulse = 0.4 + Math.sin(p.a) * 0.28;

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grd.addColorStop(0, `rgba(${cR},${cG},${cB},${pulse * 0.4})`);
        grd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cR},${cG},${cB},${pulse * 0.85})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5, pointerEvents: "none" }}
    />
  );
}
