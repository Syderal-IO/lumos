"use client";

import { CNFL_PRICE_PER_KWH } from "@/lib/mock-data";
import { LightbulbIcon, CheckIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

interface ProposalCardProps {
  kwh: number;
  pricePerKwh: number;
  buyerName: string;
  totalUsdc: number;
  distanceM?: number;
}

/**
 * Trade proposal card — Pixel art styled with pixel frame and pixel badges.
 */
export default function ProposalCard({
  kwh,
  pricePerKwh,
  buyerName,
  totalUsdc,
  distanceM,
}: ProposalCardProps) {
  const { t } = useTranslation();
  const cnflEarnings = kwh * CNFL_PRICE_PER_KWH;
  const multiplier = cnflEarnings > 0 ? (totalUsdc / cnflEarnings).toFixed(1) : "5.0";

  return (
    <div
      id="proposal-card"
      className="pixel-card fresnel-card p-4 animate-chat-bubble-in"
      style={{
        backgroundColor: "var(--card-bg)",
        borderLeft: "4px solid var(--color-solar-orange)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <LightbulbIcon size={18} color="var(--color-solar-orange)" />
        <span className="font-pixel text-[10px] font-semibold" style={{ color: "var(--color-solar-orange)" }}>
          {t("trade.proposal" as any)}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs" style={{ color: "var(--foreground)" }}>
        <div className="flex justify-between">
          <span className="opacity-70">{t("trade.energy" as any)}</span>
          <span className="font-semibold">{kwh.toFixed(2)} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">{t("trade.buyer" as any)}</span>
          <span className="font-semibold">
            {buyerName}
            {distanceM && <span className="opacity-50 ml-1">({Math.round(distanceM)}m)</span>}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">{t("trade.price" as any)}</span>
          <span className="font-semibold">${pricePerKwh.toFixed(2)}/kWh</span>
        </div>
        {/* Pixel dashed divider */}
        <div
          className="my-2"
          style={{
            height: "2px",
            background: "repeating-linear-gradient(90deg, var(--card-border) 0px, var(--card-border) 4px, transparent 4px, transparent 8px)",
          }}
        />
        <div className="flex justify-between">
          <span className="font-semibold">{t("trade.total" as any)}</span>
          <span className="font-bold text-sm font-pixel" style={{ color: "var(--color-solar-orange)" }}>
            ${totalUsdc.toFixed(2)}
          </span>
        </div>
      </div>

      {/* CNFL Comparator Badge — pixel style */}
      <div
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 pixel-border text-xs font-semibold"
        style={{
          backgroundColor: "var(--color-deep-green)",
          color: "white",
          "--pixel-border-color": "var(--color-success)",
        } as React.CSSProperties}
      >
        <CheckIcon size={10} color="#FFFFFF" />
        <span className="font-pixel text-[9px]">{multiplier}x {t("trade.vs_grid" as any)}</span>
      </div>
    </div>
  );
}
