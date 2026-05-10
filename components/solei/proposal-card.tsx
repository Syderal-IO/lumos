"use client";

import { CNFL_PRICE_PER_KWH } from "@/lib/mock-data";
import { LightbulbIcon, CheckIcon, CartIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

interface ProposalCardProps {
  kwh: number;
  pricePerKwh: number;
  buyerName: string;
  totalUsdc: number;
  distanceM?: number;
  action?: "sell" | "buy";
}

/**
 * Trade proposal card — Pixel art styled with pixel frame and pixel badges.
 * Supports both sell (orange accent) and buy (cyan accent) proposals.
 */
export default function ProposalCard({
  kwh,
  pricePerKwh,
  buyerName,
  totalUsdc,
  distanceM,
  action = "sell",
}: ProposalCardProps) {
  const { t } = useTranslation();
  const isBuy = action === "buy";
  const cnflCost = kwh * CNFL_PRICE_PER_KWH;
  const accentColor = isBuy ? "#38BDF8" : "var(--color-solar-orange)";

  // For sell: show multiplier vs grid. For buy: show savings vs grid
  const savingsPercent = cnflCost > 0
    ? Math.round(((cnflCost - totalUsdc) / cnflCost) * 100)
    : 50;
  const multiplier = cnflCost > 0 ? (totalUsdc / cnflCost).toFixed(1) : "5.0";

  return (
    <div
      id="proposal-card"
      className="pixel-card fresnel-card p-4 animate-chat-bubble-in"
      style={{
        backgroundColor: "var(--card-bg)",
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {isBuy ? (
          <CartIcon size={18} color={accentColor} />
        ) : (
          <LightbulbIcon size={18} color={accentColor} />
        )}
        <span className="font-pixel text-[10px] font-semibold" style={{ color: accentColor }}>
          {isBuy ? t("trade.proposal_buy" as any) : t("trade.proposal" as any)}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs" style={{ color: "var(--foreground)" }}>
        <div className="flex justify-between">
          <span className="opacity-70">{t("trade.energy" as any)}</span>
          <span className="font-semibold">{kwh.toFixed(2)} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">
            {isBuy ? t("trade.seller" as any) : t("trade.buyer" as any)}
          </span>
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
          <span className="font-bold text-sm font-pixel" style={{ color: accentColor }}>
            ${totalUsdc.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Badge — different for buy vs sell */}
      <div
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 pixel-border text-xs font-semibold"
        style={{
          backgroundColor: isBuy ? "rgba(56, 189, 248, 0.15)" : "var(--color-deep-green)",
          color: "white",
          "--pixel-border-color": isBuy ? "#38BDF8" : "var(--color-success)",
        } as React.CSSProperties}
      >
        <CheckIcon size={10} color="#FFFFFF" />
        <span className="font-pixel text-[9px]">
          {isBuy
            ? `${savingsPercent}% ${t("trade.savings" as any)}`
            : `${multiplier}x ${t("trade.vs_grid" as any)}`}
        </span>
      </div>
    </div>
  );
}
