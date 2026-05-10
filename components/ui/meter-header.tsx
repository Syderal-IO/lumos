"use client";

import { useEffect, useState, useRef } from "react";
import { useMeterStore } from "@/stores";
import { generateMeterReading, getDemoSafeTime } from "@/lib/mock-data";
import { SunIcon, BoltIcon, MoonIcon } from "@/components/ui/pixel-icons";
import DailyStreak from "@/components/ui/daily-streak";
import NotificationCenter from "@/components/ui/notification-center";
import WalletConnect from "@/components/ui/wallet-connect";
import QrWallet from "@/components/ui/qr-wallet";
import { useTranslation } from "@/lib/i18n";

/**
 * Meter Header — Pixel art styled status bar with stepped capacity bar.
 * The DEMO badge doubles as a time-travel control.
 */
export default function MeterHeader() {
  const { currentReading, setCurrentReading, demoHour, setDemoHour } = useMeterStore();
  const [showQR, setShowQR] = useState(false);
  const [showTimeControl, setShowTimeControl] = useState(false);
  const timeControlRef = useRef<HTMLDivElement>(null);
  const { lang, toggleLang, t } = useTranslation();

  useEffect(() => {
    if (!currentReading) {
      const { hour, minute } = getDemoSafeTime(demoHour);
      setCurrentReading(generateMeterReading(hour, minute));
    }
  }, [currentReading, setCurrentReading, demoHour]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (timeControlRef.current && !timeControlRef.current.contains(e.target as Node)) {
        setShowTimeControl(false);
      }
    };
    if (showTimeControl) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showTimeControl]);

  const generated = currentReading?.generatedKwh ?? 0;
  const surplus = currentReading?.surplusKwh ?? 0;
  const capacityPercent = generated > 0 ? Math.min(100, Math.round((generated / 5.0) * 100)) : 0;

  const activeHour = demoHour ?? new Date().getHours();
  const isDaytime = activeHour >= 6 && activeHour <= 18;

  const formatHour = (h: number) => {
    if (h === 0 || h === 24) return "12am";
    if (h === 12) return "12pm";
    if (h < 12) return `${h}am`;
    return `${h - 12}pm`;
  };

  const handleDemoHourChange = (h: number) => {
    setDemoHour(h);
    setCurrentReading(generateMeterReading(h, 30));
  };

  const handleResetTime = () => {
    setDemoHour(null);
    const { hour, minute } = getDemoSafeTime(null);
    setCurrentReading(generateMeterReading(hour, minute));
  };

  return (
    <header
      id="meter-header"
      className="h-14 flex items-center justify-between px-4 shrink-0 scanline-overlay relative"
      style={{
        background: "var(--header-bg)",
        color: "var(--header-text)",
        borderBottom: "2px solid var(--card-border)",
        overflow: "visible",
        zIndex: 50,
      }}
    >
      {/* Left: Generation info */}
      <div className="flex items-center gap-3" style={{ zIndex: 2 }}>
        <div className="pixel-glow" style={{ lineHeight: 0 }}>
          <SunIcon size={22} color="var(--color-solar-yellow)" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold font-pixel">
            {generated.toFixed(1)}
          </span>
          <span className="text-[9px] opacity-80 font-pixel">{t("header.generated")}</span>
        </div>

        {/* Surplus indicator */}
        <div className="flex items-center gap-1.5 ml-1">
          <BoltIcon size={12} color="var(--color-solar-yellow)" />
          <div className="flex flex-col leading-tight">
            <span
              className="text-xs font-semibold font-pixel"
              style={{ color: surplus > 0 ? "var(--color-solar-yellow)" : "rgba(255,255,255,0.5)" }}
            >
              {surplus.toFixed(1)}
            </span>
            <span className="text-[9px] opacity-60 font-pixel" suppressHydrationWarning>
              {t("header.surplus")}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Capacity + price */}
      <div className="hidden sm:flex items-center gap-3" style={{ zIndex: 2 }}>
        <div className="pixel-progress w-24">
          <div
            className="pixel-progress-fill"
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
        <span className="text-[9px] font-pixel opacity-70">{capacityPercent}%</span>
        {/* #17 Price indicator */}
        <span
          className="font-pixel text-[8px] px-2 py-0.5 pixel-border"
          style={{
            backgroundColor: surplus > 2 ? "rgba(34,197,94,0.2)" : surplus > 0 ? "rgba(251,191,36,0.2)" : "rgba(107,114,128,0.2)",
            color: surplus > 2 ? "#22C55E" : surplus > 0 ? "#FBBF24" : "#6B7280",
            "--pixel-border-color": surplus > 2 ? "#22C55E" : surplus > 0 ? "#FBBF24" : "#6B7280",
          } as React.CSSProperties}
        >
          {surplus > 2 ? `${t("header.price")} ↑` : surplus > 0 ? t("header.price_normal") : t("header.price_low")}
        </span>
      </div>

      {/* Right: Lang + Notifications + Wallet + DEMO Time Control */}
      <div className="flex items-center gap-3" style={{ zIndex: 2 }}>
        {/* #9 Daily Streak — desktop only */}
        <div className="hidden md:block w-28">
          <DailyStreak streak={5} />
        </div>

        {/* #16 Language Toggle */}
        <button
          onClick={toggleLang}
          className="px-3 py-2 font-pixel text-[10px] font-bold cursor-pointer transition-all hover:opacity-80"
          style={{
            backgroundColor: "rgba(168, 85, 247, 0.15)",
            color: "var(--color-accent-violet)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
          }}
          aria-label="Toggle language"
        >
          🌐 {lang === "es" ? "EN" : "ES"}
        </button>

        {/* #11 Notification Center */}
        <NotificationCenter />

        {/* #13 Wallet Connect */}
        <WalletConnect onShowQR={() => setShowQR(true)} />

        {/* DEMO badge → clickable time control */}
        <div className="relative" ref={timeControlRef}>
          <button
            onClick={() => setShowTimeControl(!showTimeControl)}
            className="font-pixel text-[11px] font-bold px-3 py-2 pixel-border cursor-pointer transition-all hover:brightness-110 flex items-center gap-1.5"
            style={{
              backgroundColor: demoHour !== null ? "rgba(249,115,22,0.85)" : "var(--color-solar-orange)",
              color: "white",
              "--pixel-border-color": demoHour !== null ? "#FBBF24" : "var(--color-solar-yellow)",
              boxShadow: demoHour !== null ? "0 0 8px rgba(249,115,22,0.4)" : "none",
            } as React.CSSProperties}
          >
            {isDaytime ? <SunIcon size={10} color="#FFF" /> : <MoonIcon size={10} color="#FFF" />}
            {demoHour !== null ? formatHour(demoHour) : "DEMO"}
          </button>

          {/* Dropdown time control — rendered as fixed overlay to avoid clipping */}
          {showTimeControl && (
            <>
              {/* Backdrop to close on click outside */}
              <div
                className="fixed inset-0"
                style={{ zIndex: 9998 }}
                onClick={() => setShowTimeControl(false)}
              />
              <div
                className="fixed w-64 pixel-card p-3"
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.97)",
                  border: "2px solid var(--color-solar-orange)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(249,115,22,0.15)",
                  zIndex: 9999,
                  top: "60px",
                  right: "16px",
                }}
              >
              {/* Title */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>
                  SIMULAR HORA
                </span>
                <span className="font-pixel text-[10px] font-bold" style={{ color: isDaytime ? "#FBBF24" : "#94A3B8" }}>
                  {formatHour(activeHour)}
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={0}
                max={23}
                step={1}
                value={activeHour}
                onChange={(e) => handleDemoHourChange(parseInt(e.target.value))}
                className="demo-time-slider w-full mb-1"
              />

              {/* Hour labels */}
              <div className="flex justify-between mb-2">
                <span className="font-pixel text-[5px]" style={{ color: "var(--foreground-secondary)" }}>0h</span>
                <span className="font-pixel text-[5px]" style={{ color: "#FBBF24" }}>6h</span>
                <span className="font-pixel text-[5px]" style={{ color: "#F97316" }}>12h</span>
                <span className="font-pixel text-[5px]" style={{ color: "#FBBF24" }}>18h</span>
                <span className="font-pixel text-[5px]" style={{ color: "var(--foreground-secondary)" }}>23h</span>
              </div>

              {/* Mini solar curve visualization */}
              <div className="flex items-end gap-px h-4 mb-2">
                {Array.from({ length: 24 }, (_, h) => {
                  const isDayH = h >= 6 && h <= 18;
                  const peak = Math.sin(((Math.max(0, Math.min(h, 18)) - 5.5) / 13) * Math.PI);
                  const barH = isDayH ? Math.max(2, peak * 16) : 2;
                  return (
                    <div
                      key={h}
                      className="flex-1"
                      style={{
                        height: `${barH}px`,
                        backgroundColor: h === activeHour
                          ? "#FBBF24"
                          : isDayH
                          ? `rgba(249,115,22,${0.2 + peak * 0.5})`
                          : "rgba(255,255,255,0.06)",
                        transition: "all 0.15s ease",
                      }}
                    />
                  );
                })}
              </div>

              {/* Reset button — only when overriding */}
              {demoHour !== null && (
                <button
                  onClick={handleResetTime}
                  className="w-full py-1 font-pixel text-[7px] cursor-pointer"
                  style={{
                    backgroundColor: "rgba(249,115,22,0.1)",
                    color: "#F97316",
                    border: "1px solid rgba(249,115,22,0.25)",
                  }}
                >
                  ↺ TIEMPO REAL ({formatHour(new Date().getHours())})
                </button>
              )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* #15 QR Modal */}
      {showQR && <QrWallet onClose={() => setShowQR(false)} />}
    </header>
  );
}
