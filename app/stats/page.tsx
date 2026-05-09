"use client";

import { useState, useMemo } from "react";

import MeterHeader from "@/components/ui/meter-header";
import BottomNav from "@/components/ui/bottom-nav";
import {
  CNFL_PRICE_PER_KWH, CO2_FACTOR_KG_PER_KWH,
  generateMeterReading, generateHeatmapData, generateMonthlyTrend, SESSION_WEATHER, getDemoSafeTime
} from "@/lib/mock-data";
import {
  ChartIcon, LeafIcon, CheckIcon, BoltIcon, SunIcon, DiamondIcon,
  TrophyIcon, BatteryIcon, HomeIcon
} from "@/components/ui/pixel-icons";
import Sparkline from "@/components/ui/sparkline";
import ProductionChart from "@/components/stats/production-chart";
import PriceHistory from "@/components/stats/price-history";
import RoiCalculator from "@/components/stats/roi-calculator";
import Leaderboard from "@/components/stats/leaderboard";
import TradeHistory from "@/components/stats/trade-history";
import Co2Certificate from "@/components/ui/co2-certificate";
import { useTranslation } from "@/lib/i18n";
import { useMeterStore } from "@/stores";
import { useAchievements } from "@/hooks/use-achievements";

// Dynamic stats computed from current meter reading + realistic baselines
function computeStats(currentReading: ReturnType<typeof generateMeterReading>) {
  const todayKwh = currentReading.generatedKwh;
  const todayUsdc = parseFloat((currentReading.surplusKwh * currentReading.suggestedPriceUsdc).toFixed(2));
  // Month stats: scale today × realistic trading days
  const tradingDaysThisMonth = 18 + Math.floor(SESSION_WEATHER.cloudFactor * 5);
  const monthKwh = parseFloat((todayKwh * tradingDaysThisMonth * 0.7).toFixed(1));
  const monthUsdc = parseFloat((todayUsdc * tradingDaysThisMonth * 0.65).toFixed(2));
  // Total stats: 3 months of operation
  const totalKwh = parseFloat((monthKwh * 2.8).toFixed(1));
  const totalUsdc = parseFloat((monthUsdc * 2.6).toFixed(2));

  return {
    today: { usdc: todayUsdc, kwh: todayKwh, trades: currentReading.buyersAvailable > 0 ? 1 : 0 },
    month: { usdc: monthUsdc, kwh: monthKwh, trades: tradingDaysThisMonth },
    total: { usdc: totalUsdc, kwh: totalKwh, trades: tradingDaysThisMonth * 3 },
  };
}



export default function StatsPage() {
  // Use meter store reading if available, otherwise generate fresh
  const storeReading = useMeterStore((s) => s.currentReading);
  const demoHour = useMeterStore((s) => s.demoHour);
  const { hour: safeHour, minute: safeMinute } = getDemoSafeTime(demoHour);
  const currentReading = storeReading || generateMeterReading(safeHour, safeMinute);

  // Memoize computed stats and generated data
  const DEMO_STATS = useMemo(() => computeStats(currentReading), [currentReading]);
  const HEATMAP_DATA = useMemo(() => generateHeatmapData(12), []);
  const MONTHLY_TREND = useMemo(() => generateMonthlyTrend(), []);

  const cnflMonth = DEMO_STATS.month.kwh * CNFL_PRICE_PER_KWH;
  const multiplier = (DEMO_STATS.month.usdc / cnflMonth).toFixed(1);
  const co2Today = (DEMO_STATS.today.kwh * CO2_FACTOR_KG_PER_KWH).toFixed(1);
  const co2Total = (DEMO_STATS.total.kwh * CO2_FACTOR_KG_PER_KWH).toFixed(1);
  const projectedMonthly = (DEMO_STATS.today.usdc * 30).toFixed(2);
  const neighborhoodAvg = 1.8;
  const userMultiplier = (DEMO_STATS.today.kwh / neighborhoodAvg).toFixed(1);
  const [showCert, setShowCert] = useState(false);
  const { t } = useTranslation();
  const achievements = useAchievements();

  return (
    <div className="flex flex-col h-screen ambient-glow scanline-animated tech-grid">
      <MeterHeader />
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-20 space-y-5 premium-inner-bg">

        {/* Summary cards — animated rainbow border + neon numbers */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("stats.today"), usdc: DEMO_STATS.today.usdc, kwh: DEMO_STATS.today.kwh },
            { label: t("stats.month"), usdc: DEMO_STATS.month.usdc, kwh: DEMO_STATS.month.kwh },
            { label: t("stats.total"), usdc: DEMO_STATS.total.usdc, kwh: DEMO_STATS.total.kwh },
          ].map((period, i) => (
            <div key={period.label} className="pixel-card-animated card-enter p-4 text-center">
              <div className="font-pixel text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--foreground-secondary)" }}>
                {period.label}
                <span className="live-indicator" />
              </div>
              <div className="font-pixel text-[18px] font-bold neon-text" style={{ color: "var(--color-solar-orange)" }}>
                ${period.usdc.toFixed(2)}
              </div>
              <div className="text-[9px] font-pixel mt-2" style={{ color: "var(--foreground-secondary)" }}>
                {period.kwh.toFixed(1)} kWh
              </div>
            </div>
          ))}
        </div>

        {/* #10 Prediction + #18 Regional Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="pixel-card pixel-card-breathe card-enter p-4" style={{ backgroundColor: "var(--card-bg)", borderLeft: "4px solid var(--color-solar-orange)" }}>
            <div className="flex items-center gap-2 mb-2">
              <SunIcon size={14} color="var(--color-solar-orange)" />
              <span className="font-pixel text-[8px] font-semibold section-title-glow" style={{ color: "var(--foreground-secondary)" }}>
                {t("stats.prediction")}
              </span>
            </div>
            <div className="font-pixel text-xl font-bold counter-glow" style={{ color: "var(--color-solar-orange)" }}>
              ${projectedMonthly}
            </div>
            <Sparkline data={MONTHLY_TREND} color="#F97316" width={100} height={20} />
          </div>
          <div className="pixel-card pixel-card-breathe card-enter p-4" style={{ backgroundColor: "var(--card-bg)", borderLeft: "4px solid var(--color-accent-blue)" }}>
            <div className="flex items-center gap-2 mb-2">
              <DiamondIcon size={14} color="var(--color-accent-blue)" />
              <span className="font-pixel text-[8px] font-semibold section-title-glow" style={{ color: "var(--foreground-secondary)" }}>
                {t("stats.regional")}
              </span>
            </div>
            <div className="font-pixel text-xl font-bold counter-glow" style={{ color: "var(--color-accent-blue)" }}>
              {userMultiplier}x
            </div>
            <span className="text-[8px] font-pixel" style={{ color: "var(--foreground-secondary)" }}>
              {t("stats.vs_avg")}
            </span>
          </div>
        </div>

        {/* CNFL Comparator */}
        <div className="pixel-card pixel-card-breathe card-enter p-4 relative overflow-hidden holo-card" style={{ backgroundColor: "var(--card-bg)", borderLeft: "4px solid var(--color-success)" }}>
          <div className="flex items-center gap-2 mb-3">
            <ChartIcon size={16} color="var(--color-success)" />
            <span className="font-pixel text-[9px] font-semibold section-title-glow" style={{ color: "var(--foreground)" }}>
              VS {t("stats.cnfl_rate")}
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="font-pixel text-[9px]" style={{ color: "var(--foreground-secondary)" }}>Lumos:</span>
              <span className="font-bold font-pixel text-[9px] neon-text" style={{ color: "var(--color-solar-orange)" }}>
                ${DEMO_STATS.month.usdc.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-pixel text-[9px]" style={{ color: "var(--foreground-secondary)" }}>CNFL:</span>
              <span className="font-pixel text-[9px]" style={{ color: "var(--foreground-secondary)" }}>
                ${cnflMonth.toFixed(2)}
              </span>
            </div>
          </div>
          <div
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 pixel-border font-pixel text-[9px] font-bold"
            style={{ backgroundColor: "var(--color-success)", color: "white", "--pixel-border-color": "var(--color-deep-green)" } as React.CSSProperties}
          >
            <CheckIcon size={10} color="#FFFFFF" />
            {multiplier}x {t("stats.more_earnings")}
          </div>
        </div>

        {/* CO2 Impact */}
        <div className="pixel-card card-enter p-4 relative overflow-hidden holo-card" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-2 mb-3">
            <LeafIcon size={16} color="var(--color-success)" />
            <span className="font-pixel text-[9px] font-semibold section-title-glow" style={{ color: "var(--foreground)" }}>
              {t("stats.co2_title")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center py-3 pixel-border" style={{ backgroundColor: "var(--background-secondary)", "--pixel-border-color": "var(--card-border)" } as React.CSSProperties}>
              <div className="font-pixel text-xl font-bold counter-glow neon-text" style={{ color: "var(--color-success)" }}>
                -{co2Today}
              </div>
              <div className="font-pixel text-[8px] mt-1" style={{ color: "var(--foreground-secondary)" }}>
                kg CO₂ {t("stats.today").toLowerCase()}
              </div>
            </div>
            <div className="text-center py-3 pixel-border" style={{ backgroundColor: "var(--background-secondary)", "--pixel-border-color": "var(--card-border)" } as React.CSSProperties}>
              <div className="font-pixel text-xl font-bold counter-glow neon-text" style={{ color: "var(--color-success)" }}>
                -{co2Total}
              </div>
              <div className="font-pixel text-[8px] mt-1" style={{ color: "var(--foreground-secondary)" }}>
                kg CO₂ {t("stats.total").toLowerCase()}
              </div>
            </div>
          </div>
          {/* Certificate button */}
          <button
            onClick={() => setShowCert(true)}
            className="mt-3 w-full py-2 font-pixel text-[9px] cursor-pointer transition-all hover:brightness-110"
            style={{ backgroundColor: "var(--color-success)", color: "white" }}
          >
            📜 {t("stats.certificate")}
          </button>
        </div>

        {/* #6 Badges — Dynamic via useAchievements */}
        <div className="pixel-card card-enter p-4 relative overflow-hidden holo-card" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrophyIcon size={16} color="var(--color-solar-orange)" />
            <span className="font-pixel text-[9px] font-semibold section-title-glow" style={{ color: "var(--foreground)" }}>
              {t("stats.badges")}
            </span>
            <span className="font-pixel text-[8px] ml-auto" style={{ color: "var(--foreground-secondary)" }}>
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((badge) => (
              <div
                key={badge.id}
                className={`text-center py-2 px-1 pixel-border transition-all ${badge.unlocked ? 'pixel-card-breathe' : ''}`}
                style={{
                  backgroundColor: badge.unlocked ? "var(--background-secondary)" : "var(--card-bg)",
                  opacity: badge.unlocked ? 1 : 0.4,
                  "--pixel-border-color": badge.unlocked ? badge.color : "#6B7280",
                } as React.CSSProperties}
              >
                <div className="flex items-center justify-center mb-1" style={{ filter: badge.unlocked ? "none" : "grayscale(1) opacity(0.5)" }}>
                  <badge.IconComponent size={20} color={badge.unlocked ? badge.color : "#6B7280"} />
                </div>
                <div className="font-pixel text-[7px]" style={{ color: badge.unlocked ? badge.color : "var(--foreground-secondary)" }}>
                  {t(badge.labelKey as any)}
                </div>
                {/* Progress bar */}
                {!badge.unlocked && badge.progress > 0 && (
                  <div className="mt-1 h-1 w-full" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${badge.progress * 100}%`, backgroundColor: badge.color }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* #15 Activity Heatmap — Premium GitHub-style with glow + stagger */}
        <div className="pixel-card card-enter p-4 relative overflow-hidden holo-card" style={{ backgroundColor: "var(--card-bg)" }}>
          {/* Header with stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BoltIcon size={14} color="var(--color-solar-orange)" />
              <span className="font-pixel text-[9px] font-semibold section-title-glow" style={{ color: "var(--foreground)" }}>
                {t("stats.heatmap")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-pixel text-[8px] font-bold neon-text" style={{ color: "var(--color-solar-orange)" }}>
                  {HEATMAP_DATA.flat().reduce((a, b) => a + b, 0)}
                </span>
                <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>
                  {t("stats.sales")}
                </span>
              </div>
              <span className="font-pixel text-[7px] px-1.5 py-0.5" style={{
                backgroundColor: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.2)",
                color: "var(--color-solar-orange)",
              }}>
                12 {t("stats.weeks")}
              </span>
            </div>
          </div>

          {/* Grid: day labels + week columns */}
          <div className="flex gap-[4px]">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-[4px] shrink-0 pr-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
                <div key={d} className="h-[16px] flex items-center">
                  <span className="font-pixel text-[6px]" style={{
                    color: i < 5 ? "rgba(255,255,255,0.4)" : "rgba(249,115,22,0.4)",
                  }}>{d}</span>
                </div>
              ))}
            </div>
            {/* Week columns with premium cells */}
            {HEATMAP_DATA.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[4px] flex-1">
                {week.map((val, di) => {
                  const intensity = val / 4;
                  const delay = (wi * 7 + di) * 15;
                  return (
                    <div
                      key={di}
                      className="heatmap-cell w-full h-[16px] relative cursor-pointer"
                      title={`W${wi + 1} · ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][di]}: ${val} ${val === 1 ? "sale" : "sales"}`}
                      style={{
                        backgroundColor: val === 0
                          ? "rgba(255,255,255,0.03)"
                          : `rgba(249, 115, 22, ${0.15 + intensity * 0.85})`,
                        boxShadow: val > 0
                          ? `0 0 ${val * 3}px rgba(249, 115, 22, ${intensity * 0.4}), inset 0 1px 0 rgba(255,255,255,${intensity * 0.1})`
                          : "none",
                        animationDelay: `${delay}ms`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Premium legend */}
          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>
                {HEATMAP_DATA.flat().filter(v => v > 0).length} {t("stats.sales").toLowerCase() === "sales" ? "active days" : "días activos"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>{t("stats.less")}</span>
              {[0, 0.15, 0.35, 0.6, 1].map((o, i) => (
                <div key={i} className="w-3 h-3 rounded-sm transition-all" style={{
                  backgroundColor: o === 0 ? "rgba(255,255,255,0.03)" : `rgba(249, 115, 22, ${0.15 + o * 0.85})`,
                  boxShadow: o > 0 ? `0 0 ${o * 4}px rgba(249,115,22,${o * 0.3})` : "none",
                }} />
              ))}
              <span className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>{t("stats.more")}</span>
            </div>
          </div>
        </div>

        {/* Batch B: Charts & Analytics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* #5 Production 24h */}
          <div className="pixel-card card-enter p-4 relative overflow-hidden holo-card" style={{ backgroundColor: "var(--card-bg)" }}>
            <div className="flex items-center gap-2 mb-2">
              <SunIcon size={14} color="var(--color-solar-orange)" />
              <span className="font-pixel text-[9px] font-semibold section-title-glow" style={{ color: "var(--foreground)" }}>
                {t("stats.production")}
              </span>
            </div>
            <ProductionChart />
          </div>

          {/* #7 Price History */}
          <div className="pixel-card card-enter p-4 relative overflow-hidden holo-card" style={{ backgroundColor: "var(--card-bg)" }}>
            <div className="flex items-center gap-2 mb-2">
              <ChartIcon size={14} color="var(--color-success)" />
              <span className="font-pixel text-[9px] font-semibold section-title-glow" style={{ color: "var(--foreground)" }}>
                {t("stats.price_history")}
              </span>
            </div>
            <PriceHistory />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* #6 ROI Calculator */}
          <div className="pixel-card card-enter p-4 relative overflow-hidden holo-card" style={{ backgroundColor: "var(--card-bg)" }}>
            <div className="flex items-center gap-2 mb-2">
              <DiamondIcon size={14} color="var(--color-solar-yellow)" />
              <span className="font-pixel text-[9px] font-semibold section-title-glow" style={{ color: "var(--foreground)" }}>
                {t("stats.roi")}
              </span>
            </div>
            <RoiCalculator />
          </div>

          {/* #8 Leaderboard */}
          <div className="pixel-card card-enter p-4 relative overflow-hidden holo-card" style={{ backgroundColor: "var(--card-bg)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🏆</span>
              <span className="font-pixel text-[9px] font-semibold section-title-glow" style={{ color: "var(--foreground)" }}>
                {t("stats.leaderboard")}
              </span>
            </div>
            <Leaderboard />
          </div>
        </div>

        {/* Transaction history — real on-chain + demo */}
        <TradeHistory />
      </div>
      <BottomNav />
      {/* #10 CO₂ Certificate Modal */}
      {showCert && (
        <Co2Certificate
          co2Kg={parseFloat(co2Total)}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
