"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";

/**
 * ASCII Art Shader — Canvas-based ASCII rendering of a solar panel grid.
 * Creates a mesmerizing text-art effect that shifts over time.
 */
const ASCII_CHARS = " .:-=+*#%@";

export default function AsciiShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const { t } = useTranslation();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 80;
    const rows = 20;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;
    const time = Date.now() * 0.001;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${Math.floor(cellH * 0.8)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Generate solar wave pattern
        const nx = x / cols;
        const ny = y / rows;
        const wave1 = Math.sin(nx * 6 + time * 0.5) * 0.5 + 0.5;
        const wave2 = Math.cos(ny * 4 + time * 0.3) * 0.5 + 0.5;
        const wave3 = Math.sin((nx + ny) * 3 + time * 0.7) * 0.5 + 0.5;
        const intensity = (wave1 + wave2 + wave3) / 3;

        const charIndex = Math.floor(intensity * (ASCII_CHARS.length - 1));
        const char = ASCII_CHARS[charIndex];

        // Color: orange gradient based on intensity
        const r = Math.floor(249 * intensity);
        const g = Math.floor(115 * intensity);
        const b = Math.floor(22 * intensity * 0.3);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillText(
          char,
          x * cellW + cellW / 2,
          y * cellH + cellH / 2
        );
      }
    }

    frameRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    };

    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [render]);

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto section-glow">
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 font-pixel text-[9px] pixel-border"
          style={{
            backgroundColor: "rgba(249, 115, 22, 0.1)",
            "--pixel-border-color": "rgba(249, 115, 22, 0.3)",
            color: "#F97316",
          } as React.CSSProperties}
        >
          ⚡ {t("landing.energy_badge" as any)}
        </div>
        <h2
          className="font-pixel text-xl md:text-2xl font-bold"
          style={{ color: "white", textShadow: "0 0 30px rgba(249,115,22,0.2)" }}
        >
          {t("landing.energy_title_1" as any)}{" "}
          <span style={{ color: "var(--color-solar-orange)" }}>{t("landing.energy_title_2" as any)}</span>
          {" "}{t("landing.energy_title_3" as any)}{" "}
          <span style={{ color: "var(--color-accent-violet)" }}>{t("landing.energy_title_4" as any)}</span>
        </h2>
      </div>

      <div className="pixel-card fresnel-card overflow-hidden p-1 relative">
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 w-full h-0.5 z-10"
          style={{ background: "linear-gradient(90deg, #F97316, transparent 50%, #A78BFA)" }}
        />
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{
            height: "280px",
            background: "var(--background)",
          }}
        />
      </div>

      {/* Decorative tags */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {["ASCII", "Canvas", "WebGL", "Real-time"].map((tag) => (
          <span
            key={tag}
            className="font-pixel text-[9px] px-3 py-1.5 pixel-border"
            style={{
              backgroundColor: "rgba(249,115,22,0.05)",
              color: "rgba(255,255,255,0.35)",
              "--pixel-border-color": "rgba(249,115,22,0.15)",
            } as React.CSSProperties}
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
