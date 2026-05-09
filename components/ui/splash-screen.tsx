"use client";

import { useEffect, useState } from "react";
import { SunIcon } from "@/components/ui/pixel-icons";

/**
 * #1 Splash Screen — Retro-game loading screen with progress bar.
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2200);
    const remove = setTimeout(() => setVisible(false), 2700);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
      />

      {/* Logo */}
      <div style={{ animation: "splash-logo-pulse 1.5s ease-in-out infinite" }}>
        <SunIcon size={64} color="#F97316" />
      </div>

      {/* Title */}
      <h1 className="text-xl" style={{ color: "var(--foreground)" }}>
        Lumos
      </h1>

      {/* Subtitle */}
      <p className="text-[9px]" style={{ color: "var(--foreground-secondary)" }}>
        Conectando a Solana Devnet...
      </p>

      {/* Progress bar */}
      <div className="w-48 h-3 pixel-border" style={{ backgroundColor: "var(--card-bg)", "--pixel-border-color": "var(--card-border)" } as React.CSSProperties}>
        <div
          className="h-full"
          style={{
            backgroundColor: "#F97316",
            animation: "splash-bar-fill 2s ease-out forwards",
          }}
        />
      </div>

      {/* Version */}
      <span className="text-[8px]" style={{ color: "var(--foreground-secondary)", opacity: 0.5 }}>
        v1.0 • Solana Devnet
      </span>
    </div>
  );
}
