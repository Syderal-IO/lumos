"use client";

import { useEffect, useRef } from "react";

/**
 * #15 QR Wallet — Canvas-based QR code generator (no external deps).
 * Uses a simple pixel-art pattern representation of the wallet address.
 */
const DEMO_WALLET = "9H7qdDGWJCQunsnuTjw8zCW8mYq6fKmArzovUv8MoJLZ";

function generateQRPattern(data: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (3 corners)
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      const isOuter = i === 0 || i === 6 || j === 0 || j === 6;
      const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      grid[r + i][c + j] = isOuter || isInner;
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Data-driven pattern from address hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) continue;
      if (r < 9 && c < 9) continue;
      if (r < 9 && c > size - 9) continue;
      if (r > size - 9 && c < 9) continue;
      const bit = ((hash >>> ((r * size + c) % 31)) & 1) === 1;
      const bit2 = ((r + c) % 3 === 0) !== bit;
      grid[r][c] = bit2;
    }
  }

  return grid;
}

export default function QrWallet({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pattern = generateQRPattern(DEMO_WALLET);
    const cellSize = 8;
    const size = pattern.length * cellSize;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    // Cells
    ctx.fillStyle = "#0A0E1A";
    pattern.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      });
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div
        className="pixel-card p-5 text-center"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "2px solid var(--color-accent-violet)",
          boxShadow: "0 0 30px rgba(168, 85, 247, 0.3)",
        }}
      >
        <h3 className="font-pixel text-[9px] font-bold mb-3" style={{ color: "var(--foreground)" }}>
          📱 Tu Wallet QR
        </h3>

        <div className="inline-block p-3 mb-3" style={{ backgroundColor: "#FFFFFF" }}>
          <canvas ref={canvasRef} className="w-40 h-40" style={{ imageRendering: "pixelated" }} />
        </div>

        <p className="font-pixel text-[7px] mb-3 break-all px-2" style={{ color: "var(--foreground-secondary)" }}>
          {DEMO_WALLET}
        </p>

        <button
          onClick={onClose}
          className="px-4 py-1.5 font-pixel text-[8px] cursor-pointer"
          style={{
            backgroundColor: "var(--background-secondary)",
            color: "var(--foreground-secondary)",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
