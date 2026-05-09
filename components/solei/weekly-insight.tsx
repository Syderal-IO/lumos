"use client";

import { SunIcon, BoltIcon, LeafIcon, CheckIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

/**
 * #16 Solei Weekly Insights — Auto-generated summary card.
 */
export default function WeeklyInsight() {
  const { t } = useTranslation();

  return (
    <div className="pixel-card fresnel-card p-4 space-y-3" style={{ backgroundColor: "var(--card-bg)" }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 flex items-center justify-center pixel-border" style={{ backgroundColor: "var(--color-solar-orange)", "--pixel-border-color": "var(--color-solar-yellow)" } as React.CSSProperties}>
          <SunIcon size={14} color="#FFF" />
        </div>
        <span className="font-pixel text-[9px] font-bold" style={{ color: "var(--color-solar-orange)" }}>
          {t("insight.title")}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center py-2 pixel-border" style={{ backgroundColor: "var(--background-secondary)", "--pixel-border-color": "var(--card-border)" } as React.CSSProperties}>
          <BoltIcon size={12} color="var(--color-solar-yellow)" />
          <div className="font-pixel text-[9px] font-bold mt-1" style={{ color: "var(--color-solar-yellow)" }}>12.3</div>
          <div className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>kWh</div>
        </div>
        <div className="text-center py-2 pixel-border" style={{ backgroundColor: "var(--background-secondary)", "--pixel-border-color": "var(--card-border)" } as React.CSSProperties}>
          <CheckIcon size={12} color="var(--color-solar-orange)" />
          <div className="font-pixel text-[9px] font-bold mt-1" style={{ color: "var(--color-solar-orange)" }}>$1.84</div>
          <div className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>USDC</div>
        </div>
        <div className="text-center py-2 pixel-border" style={{ backgroundColor: "var(--background-secondary)", "--pixel-border-color": "var(--card-border)" } as React.CSSProperties}>
          <LeafIcon size={12} color="var(--color-success)" />
          <div className="font-pixel text-[9px] font-bold mt-1" style={{ color: "var(--color-success)" }}>-5.4</div>
          <div className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>kg CO₂</div>
        </div>
      </div>

      <p className="text-[8px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
        {t("insight.best_hour")} {t("insight.neighbors")}
      </p>
    </div>
  );
}
