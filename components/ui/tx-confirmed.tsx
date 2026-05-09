"use client";

import { useEffect, useState } from "react";
import { CheckIcon, BoltIcon, LeafIcon } from "@/components/ui/pixel-icons";
import { triggerConfetti } from "@/components/ui/confetti";
import { useToast } from "@/components/ui/toast-provider";
import { useTranslation } from "@/lib/i18n";

interface TxConfirmedProps {
  netUsdc: number;
  kwhDelivered: number;
  co2AvoidedKg: number;
  explorerUrl?: string;
  buyerName: string;
  isSimulated?: boolean;
}

/**
 * Transaction confirmed card — Pixel art celebration with pixel confetti.
 */
export default function TxConfirmed({
  netUsdc,
  kwhDelivered,
  co2AvoidedKg,
  explorerUrl,
  buyerName,
  isSimulated,
}: TxConfirmedProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const { addToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    triggerConfetti();
    addToast(`${t("trade.completed" as any)}! +$${netUsdc.toFixed(2)} USDC`, "energy");
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="animate-chat-bubble-in pixel-card overflow-hidden relative"
      style={{
        backgroundColor: "var(--card-bg)",
        "--pixel-border-color": "var(--color-success)",
      } as React.CSSProperties}
    >
      {/* Pixel confetti — squares not circles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 opacity-90"
              style={{
                backgroundColor: i % 4 === 0
                  ? "var(--color-solar-orange)"
                  : i % 4 === 1
                  ? "var(--color-success)"
                  : i % 4 === 2
                  ? "var(--color-solar-yellow)"
                  : "var(--color-accent-violet)",
                left: `${8 + Math.random() * 84}%`,
                top: `${Math.random() * 100}%`,
                animation: `confetti-fall ${1.5 + Math.random() * 1.5}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                imageRendering: "pixelated",
              }}
            />
          ))}
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(60px) rotate(180deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Success header — pixel styled */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: "var(--color-success)", color: "white" }}
      >
        <CheckIcon size={16} color="#FFFFFF" />
        <span className="font-pixel text-[10px] font-semibold">{t("trade.completed" as any)}</span>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Earnings — big pixel number */}
        <div className="text-center py-2">
          <div
            className="text-3xl font-bold font-pixel counter-glow animate-count-up"
            style={{ color: "var(--color-solar-orange)" }}
          >
            +${netUsdc.toFixed(2)}
          </div>
          <div className="text-[9px] mt-1 font-pixel" style={{ color: "var(--foreground-secondary)" }}>
            {t("trade.credited" as any)}
          </div>
        </div>

        {/* Stats row — pixel framed */}
        <div
          className="flex items-center justify-around py-2.5 pixel-border"
          style={{
            backgroundColor: "var(--background-secondary)",
            "--pixel-border-color": "var(--card-border)",
          } as React.CSSProperties}
        >
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1">
              <BoltIcon size={12} color="var(--color-solar-orange)" />
              <span className="text-sm font-semibold font-pixel" style={{ color: "var(--foreground)" }}>
                {kwhDelivered.toFixed(1)}
              </span>
            </div>
            <div className="text-[9px] font-pixel" style={{ color: "var(--foreground-secondary)" }}>kWh</div>
          </div>
          <div className="w-0.5 h-6" style={{ backgroundColor: "var(--card-border)" }} />
          <div className="text-center px-2">
            <span className="text-sm font-semibold font-pixel" style={{ color: "var(--foreground)" }}>
              {buyerName}
            </span>
            <div className="text-[9px] font-pixel" style={{ color: "var(--foreground-secondary)" }}>
              {t("trade.buyer_label" as any)}
            </div>
          </div>
          <div className="w-0.5 h-6" style={{ backgroundColor: "var(--card-border)" }} />
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1">
              <LeafIcon size={12} color="var(--color-success)" />
              <span className="text-sm font-semibold font-pixel" style={{ color: "var(--color-success)" }}>
                -{co2AvoidedKg.toFixed(1)}
              </span>
            </div>
            <div className="text-[9px] font-pixel" style={{ color: "var(--foreground-secondary)" }}>kg CO₂</div>
          </div>
        </div>

        {/* Explorer link + sim badge */}
        <div className="flex items-center justify-between">
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-[9px] font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--color-solar-orange)" }}
            >
              {t("trade.view_explorer" as any)}
            </a>
          )}
          {isSimulated && (
            <span
              className="font-pixel text-[9px] font-bold px-2 py-1 pixel-border"
              style={{
                backgroundColor: "var(--color-solar-orange)",
                color: "white",
                "--pixel-border-color": "var(--color-solar-yellow)",
              } as React.CSSProperties}
            >
              DEMO
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
