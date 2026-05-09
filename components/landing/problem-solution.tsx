"use client";

import { useTranslation } from "@/lib/i18n";
import { SunIcon, BoltIcon, LeafIcon } from "@/components/ui/pixel-icons";

/**
 * ProblemSolution — Landing section showing the problem and Lumos's solution.
 * Pixel-art styled cards with glow effects.
 */
export default function ProblemSolution() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Problem Card */}
        <div
          className="pixel-card fresnel-card p-6 relative overflow-hidden"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.05)",
            borderColor: "rgba(239, 68, 68, 0.2)",
          }}
        >
          {/* Glow accent */}
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ background: "linear-gradient(90deg, #EF4444, transparent)" }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 flex items-center justify-center pixel-border"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                "--pixel-border-color": "#EF4444",
              } as React.CSSProperties}
            >
              <span className="text-lg">⚡</span>
            </div>
            <h2 className="font-pixel text-sm font-bold" style={{ color: "#EF4444" }}>
              {t("landing.problem_title")}
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-secondary, rgba(255,255,255,0.7))" }}>
            {t("landing.problem_desc")}
          </p>
          <ul className="mt-4 space-y-2">
            {["landing.problem_1", "landing.problem_2", "landing.problem_3"].map((key) => (
              <li key={key} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                <span className="font-pixel text-[8px] mt-0.5" style={{ color: "#EF4444" }}>✕</span>
                {t(key as any)}
              </li>
            ))}
          </ul>
        </div>

        {/* Solution Card */}
        <div
          className="pixel-card fresnel-card p-6 relative overflow-hidden"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.05)",
            borderColor: "rgba(34, 197, 94, 0.2)",
          }}
        >
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ background: "linear-gradient(90deg, #22C55E, transparent)" }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 flex items-center justify-center pixel-border"
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                "--pixel-border-color": "#22C55E",
              } as React.CSSProperties}
            >
              <SunIcon size={20} color="#22C55E" />
            </div>
            <h2 className="font-pixel text-sm font-bold" style={{ color: "#22C55E" }}>
              {t("landing.solution_title")}
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-secondary, rgba(255,255,255,0.7))" }}>
            {t("landing.solution_desc")}
          </p>
          <ul className="mt-4 space-y-2">
            {["landing.solution_1", "landing.solution_2", "landing.solution_3"].map((key) => (
              <li key={key} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                <span className="font-pixel text-[8px] mt-0.5" style={{ color: "#22C55E" }}>✓</span>
                {t(key as any)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
