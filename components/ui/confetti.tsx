"use client";

/**
 * #14 Confetti Solar — Pixel art confetti explosion.
 * Call triggerConfetti() to burst solar particles.
 */
const SHAPES = ["☀", "⚡", "🌿", "✦", "◆"];
const COLORS = ["#F97316", "#FBBF24", "#22C55E", "#A78BFA", "#3B82F6"];

export function triggerConfetti() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  for (let i = 0; i < 30; i++) {
    const el = document.createElement("span");
    el.className = "confetti-particle";
    el.textContent = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = `${-10 + Math.random() * 20}px`;
    el.style.fontSize = `${10 + Math.random() * 16}px`;
    el.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.animationDuration = `${1.5 + Math.random() * 2}s`;
    el.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(el);
  }

  setTimeout(() => container.remove(), 4000);
}
