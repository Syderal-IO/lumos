"use client";

import { useMemo } from "react";
import { SunIcon, BoltIcon } from "@/components/ui/pixel-icons";

/**
 * ForecastCard — Visual solar production forecast for the next 6 hours.
 * Shows bar chart with confidence intervals and best-sell-time indicator.
 * Rendered inline in the chat when forecast data is available.
 */
interface ForecastCardProps {
  mean: number[];
  p10?: number[];
  p90?: number[];
  startHour: number;
}

export default function ForecastCard({ mean, p10, p90, startHour }: ForecastCardProps) {
  const maxVal = useMemo(() => Math.max(...(p90 || mean), 0.1), [mean, p90]);

  const bestHourIdx = useMemo(() => {
    let maxIdx = 0;
    mean.forEach((v, i) => { if (v > mean[maxIdx]) maxIdx = i; });
    return maxIdx;
  }, [mean]);

  const totalForecast = useMemo(() => mean.reduce((a, b) => a + b, 0).toFixed(1), [mean]);

  return (
    <div
      className="animate-chat-bubble-in pixel-card overflow-hidden"
      style={{
        backgroundColor: "var(--card-bg)",
        "--pixel-border-color": "var(--color-solar-orange)",
      } as React.CSSProperties}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "2px solid var(--card-border)" }}
      >
        <div className="flex items-center gap-2">
          <SunIcon size={14} color="var(--color-solar-orange)" />
          <span className="font-pixel text-[9px] font-bold" style={{ color: "var(--foreground)" }}>
            Pronóstico Solar
          </span>
        </div>
        <span className="font-pixel text-[7px] px-2 py-0.5" style={{
          backgroundColor: "rgba(249,115,22,0.15)",
          color: "var(--color-solar-orange)",
          border: "1px solid rgba(249,115,22,0.3)",
        }}>
          {totalForecast} kWh total
        </span>
      </div>

      {/* Bar chart */}
      <div className="px-4 py-3">
        <div className="flex items-end gap-1.5" style={{ height: "80px" }}>
          {mean.map((val, i) => {
            const height = (val / maxVal) * 100;
            const hour = (startHour + i + 1) % 24;
            const isBest = i === bestHourIdx && val > 0;
            const p10Val = p10?.[i] ?? val * 0.8;
            const p90Val = p90?.[i] ?? val * 1.2;
            const p10Height = (p10Val / maxVal) * 100;
            const p90Height = (p90Val / maxVal) * 100;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {/* Bar with confidence range */}
                <div className="w-full relative flex items-end justify-center" style={{ height: "60px" }}>
                  {/* P90 (light background) */}
                  {p90 && (
                    <div
                      className="absolute bottom-0 w-full"
                      style={{
                        height: `${p90Height}%`,
                        backgroundColor: "rgba(249,115,22,0.08)",
                        borderRadius: "2px 2px 0 0",
                      }}
                    />
                  )}
                  {/* Mean (solid bar) */}
                  <div
                    className="relative w-full transition-all duration-500"
                    style={{
                      height: `${height}%`,
                      minHeight: val > 0 ? "4px" : "1px",
                      backgroundColor: isBest ? "var(--color-solar-orange)" : "rgba(249,115,22,0.5)",
                      boxShadow: isBest ? "0 0 8px rgba(249,115,22,0.5)" : "none",
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                </div>
                {/* Hour label */}
                <span
                  className="font-pixel text-[6px]"
                  style={{ color: isBest ? "var(--color-solar-orange)" : "var(--foreground-secondary)" }}
                >
                  {hour}h
                </span>
              </div>
            );
          })}
        </div>

        {/* Best time indicator */}
        {mean[bestHourIdx] > 0 && (
          <div
            className="flex items-center gap-1.5 mt-3 pt-2"
            style={{ borderTop: "1px solid var(--card-border)" }}
          >
            <BoltIcon size={10} color="var(--color-solar-orange)" />
            <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>
              Mejor momento para vender:
            </span>
            <span className="font-pixel text-[8px] font-bold" style={{ color: "var(--color-solar-orange)" }}>
              {((startHour + bestHourIdx + 1) % 24)}:00
            </span>
            <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>
              ({mean[bestHourIdx].toFixed(1)} kWh)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
