import { create } from "zustand";

// ═══════════════════════════════════════════════
// Theme Store — Light/Dark mode with persistence
// ═══════════════════════════════════════════════

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark", // default dark (matches current design)

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("gl-theme", theme);
    }
  },

  toggleTheme: () => {
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        // #3 Crossfade overlay
        const overlay = document.createElement("div");
        overlay.className = "theme-transition-overlay";
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 400);

        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("gl-theme", next);
      }
      return { theme: next };
    });
  },
}));
