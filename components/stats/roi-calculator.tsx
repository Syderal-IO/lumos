"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

/**
 * #6 ROI Calculator — Premium interactive calculator with glowing sliders,
 * animated results cards, and a 12-month projection bar chart with tooltips.
 */
export default function RoiCalculator() {
  const [panels, setPanels] = useState(6);
  const [sunHours, setSunHours] = useState(5);
  const { t } = useTranslation();
  const pricePerKwh = 0.09;
  const kwhPerPanel = 0.35;

  const dailyKwh = panels * sunHours * kwhPerPanel;
  const surplusRatio = 0.6;
  const dailySurplus = dailyKwh * surplusRatio;
  const monthlyUsdc = dailySurplus * pricePerKwh * 30;
  const annualUsdc = monthlyUsdc * 12;

  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const months = Array.from({ length: 12 }, (_, i) => {
    const seasonal = 1 + 0.15 * Math.sin(((i + 3) / 12) * Math.PI * 2);
    return monthlyUsdc * seasonal;
  });
  const maxMonth = Math.max(...months);

  const panelPercent = ((panels - 1) / 19) * 100;
  const sunPercent = ((sunHours - 3) / 5) * 100;

  return (
    <div className="space-y-4">
      {/* Panels slider — premium styled */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>{t("roi.panels")}</span>
          <div className="flex items-baseline gap-1">
            <span className="font-pixel text-[12px] font-bold neon-text" style={{ color: "var(--color-solar-orange)" }}>{panels}</span>
            <span className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>☀️</span>
          </div>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)" }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
            style={{
              width: `${panelPercent}%`,
              background: "linear-gradient(90deg, rgba(249,115,22,0.3), #F97316)",
              boxShadow: "0 0 8px rgba(249,115,22,0.4)",
            }}
          />
          <input type="range" min={1} max={20} value={panels} onChange={(e) => setPanels(+e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          {/* Custom thumb */}
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none transition-all duration-200"
            style={{
              left: `calc(${panelPercent}% - 8px)`,
              background: "linear-gradient(135deg, #FBBF24, #F97316)",
              boxShadow: "0 0 10px rgba(249,115,22,0.6), 0 0 20px rgba(249,115,22,0.2)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>
      </div>

      {/* Sun hours slider */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>{t("roi.sun_hours")}</span>
          <div className="flex items-baseline gap-1">
            <span className="font-pixel text-[12px] font-bold neon-text" style={{ color: "var(--color-solar-yellow)" }}>{sunHours}h</span>
          </div>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
            style={{
              width: `${sunPercent}%`,
              background: "linear-gradient(90deg, rgba(251,191,36,0.3), #FBBF24)",
              boxShadow: "0 0 8px rgba(251,191,36,0.4)",
            }}
          />
          <input type="range" min={3} max={8} value={sunHours} onChange={(e) => setSunHours(+e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none transition-all duration-200"
            style={{
              left: `calc(${sunPercent}% - 8px)`,
              background: "linear-gradient(135deg, #FDE68A, #FBBF24)",
              boxShadow: "0 0 10px rgba(251,191,36,0.6), 0 0 20px rgba(251,191,36,0.2)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>
      </div>

      {/* Results — premium cards with glow */}
      <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="relative text-center py-3 rounded-lg overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))",
            border: "1px solid rgba(249,115,22,0.25)",
            boxShadow: "0 0 15px rgba(249,115,22,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
          <div className="font-pixel text-[14px] font-bold neon-text" style={{ color: "var(--color-solar-orange)" }}>
            ${monthlyUsdc.toFixed(2)}
          </div>
          <div className="font-pixel text-[7px] mt-1" style={{ color: "var(--foreground-secondary)" }}>
            {t("roi.monthly")}
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(249,115,22,0.06) 50%, transparent 60%)",
            animation: "shimmer-slide 3s infinite",
          }} />
        </div>
        <div className="relative text-center py-3 rounded-lg overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))",
            border: "1px solid rgba(34,197,94,0.25)",
            boxShadow: "0 0 15px rgba(34,197,94,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
          <div className="font-pixel text-[14px] font-bold neon-text" style={{ color: "var(--color-success)" }}>
            ${annualUsdc.toFixed(2)}
          </div>
          <div className="font-pixel text-[7px] mt-1" style={{ color: "var(--foreground-secondary)" }}>
            {t("roi.annual")}
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(34,197,94,0.06) 50%, transparent 60%)",
            animation: "shimmer-slide 3s infinite 0.5s",
          }} />
        </div>
      </div>

      {/* 12-month projection — premium bar chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>
            {t("roi.projection")}
          </span>
          <span className="font-pixel text-[7px] font-bold" style={{ color: "var(--color-solar-orange)" }}>
            ${annualUsdc.toFixed(0)} USDC
          </span>
        </div>
        <div className="flex items-end gap-[3px] h-16 px-1 py-1 rounded-lg"
          style={{ backgroundColor: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.08)" }}>
          {months.map((val, i) => {
            const heightPct = maxMonth > 0 ? (val / maxMonth) * 100 : 0;
            const intensity = 0.3 + (val / maxMonth) * 0.7;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* Bar with gradient */}
                <div
                  className="w-full rounded-t-sm transition-all duration-300 relative overflow-hidden"
                  style={{
                    height: `${heightPct}%`,
                    background: `linear-gradient(to top, rgba(249,115,22,${intensity * 0.6}), rgba(251,191,36,${intensity}))`,
                    minHeight: 3,
                    boxShadow: `0 0 ${intensity * 6}px rgba(249,115,22,${intensity * 0.3})`,
                  }}
                >
                  {/* Inner shine */}
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%)",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
        {/* Month labels */}
        <div className="flex justify-between mt-1 px-1">
          {MONTH_LABELS.map((m, i) => (
            <span key={i} className="flex-1 text-center font-pixel text-[5px]"
              style={{ color: i % 3 === 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)" }}>
              {i % 3 === 0 ? m : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
