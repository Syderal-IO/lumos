"use client";

import { useState } from "react";
import { useMeterStore } from "@/stores";
import { generateMeterReading } from "@/lib/mock-data";
import { SunIcon, MoonIcon } from "@/components/ui/pixel-icons";

/**
 * Demo Time Control — floating slider to override the simulated hour.
 * Only visible when the URL contains ?demo=true.
 * Allows the user to "fast-forward" to any hour of the day to see
 * solar generation, trades, and AI responses change in real time.
 */
export default function DemoTimeControl() {
  const { demoHour, setDemoHour, setCurrentReading } = useMeterStore();
  const [collapsed, setCollapsed] = useState(false);

  const currentHour = demoHour ?? new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour <= 18;

  const handleHourChange = (newHour: number) => {
    setDemoHour(newHour);
    // Immediately update the meter reading for the new hour
    const reading = generateMeterReading(newHour, 30); // use :30 for mid-hour
    setCurrentReading(reading);
  };

  const handleReset = () => {
    setDemoHour(null);
    const now = new Date();
    setCurrentReading(generateMeterReading(now.getHours(), now.getMinutes()));
  };

  // Hour label helper
  const formatHour = (h: number) => {
    if (h === 0 || h === 24) return "12am";
    if (h === 12) return "12pm";
    if (h < 12) return `${h}am`;
    return `${h - 12}pm`;
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-20 right-4 z-[100] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer pixel-border"
        style={{
          backgroundColor: "rgba(249,115,22,0.9)",
          "--pixel-border-color": "#FBBF24",
          boxShadow: "0 0 20px rgba(249,115,22,0.5)",
        } as React.CSSProperties}
        title="Demo Time Control"
      >
        {isDaytime ? (
          <SunIcon size={16} color="#FFF" />
        ) : (
          <MoonIcon size={16} color="#FFF" />
        )}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-20 right-4 z-[100] pixel-card p-3 w-56"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        border: "2px solid var(--color-solar-orange)",
        boxShadow: "0 0 30px rgba(249,115,22,0.3)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isDaytime ? (
            <SunIcon size={12} color="#FBBF24" />
          ) : (
            <MoonIcon size={12} color="#94A3B8" />
          )}
          <span className="font-pixel text-[8px] font-bold" style={{ color: "var(--color-solar-orange)" }}>
            DEMO TIME
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="font-pixel text-[8px] cursor-pointer px-1"
          style={{ color: "var(--foreground-secondary)" }}
        >
          ▾
        </button>
      </div>

      {/* Current time display */}
      <div className="text-center mb-2">
        <span
          className="font-pixel text-lg font-bold"
          style={{ color: isDaytime ? "#FBBF24" : "#94A3B8" }}
        >
          {formatHour(currentHour)}
        </span>
        {demoHour !== null && (
          <span className="font-pixel text-[7px] ml-1.5 px-1 py-0.5" style={{
            backgroundColor: "rgba(249,115,22,0.2)",
            color: "#F97316",
            border: "1px solid rgba(249,115,22,0.3)",
          }}>
            OVERRIDE
          </span>
        )}
      </div>

      {/* Slider */}
      <div className="relative mb-2">
        <input
          type="range"
          min={0}
          max={23}
          step={1}
          value={currentHour}
          onChange={(e) => handleHourChange(parseInt(e.target.value))}
          className="demo-time-slider w-full"
          style={{
            accentColor: "#F97316",
          }}
        />
        {/* Day/night label bar */}
        <div className="flex justify-between mt-0.5">
          <span className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>0h</span>
          <span className="font-pixel text-[6px]" style={{ color: "#FBBF24" }}>6h</span>
          <span className="font-pixel text-[6px]" style={{ color: "#F97316" }}>12h</span>
          <span className="font-pixel text-[6px]" style={{ color: "#FBBF24" }}>18h</span>
          <span className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>23h</span>
        </div>
      </div>

      {/* Solar preview bar */}
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 24 }, (_, h) => {
          const isDayH = h >= 6 && h <= 18;
          const isPeak = h >= 9 && h <= 15;
          return (
            <div
              key={h}
              className="flex-1 rounded-sm"
              style={{
                height: isPeak ? "8px" : isDayH ? "5px" : "2px",
                backgroundColor: h === currentHour
                  ? "#FBBF24"
                  : isPeak
                  ? "rgba(249,115,22,0.5)"
                  : isDayH
                  ? "rgba(249,115,22,0.25)"
                  : "rgba(255,255,255,0.08)",
                transition: "all 0.2s ease",
              }}
            />
          );
        })}
      </div>

      {/* Reset button */}
      {demoHour !== null && (
        <button
          onClick={handleReset}
          className="w-full py-1 font-pixel text-[7px] cursor-pointer transition-all"
          style={{
            backgroundColor: "rgba(249,115,22,0.15)",
            color: "#F97316",
            border: "1px solid rgba(249,115,22,0.3)",
          }}
        >
          ↺ REAL TIME ({formatHour(new Date().getHours())})
        </button>
      )}
    </div>
  );
}
