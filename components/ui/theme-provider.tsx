"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme";

/**
 * ThemeProvider — Hydrates theme from localStorage on mount.
 * Renders nothing, just runs the hydration effect.
 */
export default function ThemeProvider() {
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const stored = localStorage.getItem("gl-theme") as "light" | "dark" | null;
    const preferred = stored || (
      window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
    );
    setTheme(preferred);
  }, [setTheme]);

  return null;
}
