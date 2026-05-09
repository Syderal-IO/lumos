"use client";

import { useState, useEffect, useCallback } from "react";
import { SunIcon } from "@/components/ui/pixel-icons";

/**
 * PWA Install Prompt — Always visible on the landing page.
 * If `beforeinstallprompt` fires, the button triggers native install.
 * Otherwise it's a static promotional banner.
 */
export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Hide if already installed as standalone
    if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect successful install
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setInstalled(true);
      }
    } catch {
      // User cancelled
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Hide completely only if already installed
  if (installed) return null;

  return (
    <div
      className="w-full flex justify-center px-4 py-6"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="pixel-card flex items-center gap-3 px-4 py-3 w-full"
        style={{
          maxWidth: "480px",
          backgroundColor: "var(--card-bg)",
          border: "2px solid var(--color-solar-orange)",
          boxShadow: "0 4px 24px rgba(249, 115, 22, 0.2), 0 0 0 1px rgba(249,115,22,0.1)",
        }}
      >
        {/* Pixel app icon */}
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0"
          style={{
            backgroundColor: "var(--color-solar-orange)",
            boxShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
          }}
        >
          <SunIcon size={22} color="#FFFFFF" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-[11px] font-bold" style={{ color: "var(--foreground)" }}>
            Instalar Lumos
          </div>
          <div className="font-pixel text-[8px] mt-0.5" style={{ color: "var(--foreground-secondary)" }}>
            Acceso directo · Sin tienda · Funciona offline
          </div>
        </div>

        {/* Install button */}
        <button
          onClick={deferredPrompt ? handleInstall : undefined}
          disabled={installing || !deferredPrompt}
          className="px-4 py-2 font-pixel text-[10px] font-bold cursor-pointer transition-all hover:brightness-110 shrink-0 flex items-center gap-1.5 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-solar-orange)", color: "white" }}
        >
          {installing ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <>
              {/* Pixel download arrow */}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ imageRendering: "pixelated" }}>
                <rect x="4" y="0" width="2" height="6" fill="white" />
                <rect x="2" y="4" width="6" height="2" fill="white" />
                <rect x="3" y="5" width="4" height="2" fill="white" />
                <rect x="4" y="6" width="2" height="2" fill="white" />
                <rect x="0" y="8" width="10" height="2" fill="white" />
              </svg>
              Instalar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
