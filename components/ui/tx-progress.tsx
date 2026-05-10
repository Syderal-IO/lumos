"use client";

import { useState, useEffect, useRef } from "react";
import { LockIcon, CoinIcon, BoltIcon, SatelliteIcon, CheckIcon, PartyIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

interface TxProgressProps {
  isActive: boolean;
  onComplete?: () => void;
}

/**
 * Transaction progress — Pixel art styled with stepped progress blocks.
 */
export default function TxProgress({ isActive, onComplete }: TxProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [percent, setPercent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useTranslation();

  const STAGES = [
    { label: t("trade.processing_stage_1") || "Iniciando escrow", percent: 15, Icon: LockIcon },
    { label: t("trade.processing_stage_2") || "Bloqueando fondos", percent: 35, Icon: CoinIcon },
    { label: t("trade.processing_stage_3") || "Transfiriendo", percent: 55, Icon: BoltIcon },
    { label: t("trade.processing_stage_4") || "Leyendo medidor", percent: 75, Icon: SatelliteIcon },
    { label: t("trade.processing_stage_5") || "Confirmando", percent: 90, Icon: CheckIcon },
    { label: t("trade.processing_stage_6") || "Pago acreditado", percent: 100, Icon: PartyIcon },
  ] as const;


  useEffect(() => {
    if (!isActive) {
      setCurrentStage(0);
      setPercent(0);
      return;
    }

    const stageDurations = [600, 800, 1200, 800, 600, 400];
    let stage = 0;

    const advanceStage = () => {
      if (stage >= STAGES.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete?.();
        return;
      }
      setCurrentStage(stage);
      setPercent(STAGES[stage].percent);
      stage++;
    };

    advanceStage();

    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 100;
      const threshold = stageDurations[stage - 1] || 500;
      if (elapsed >= threshold) {
        elapsed = 0;
        advanceStage();
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, onComplete]);

  if (!isActive && percent === 0) return null;

  const stage = STAGES[currentStage] || STAGES[STAGES.length - 1];
  const StageIcon = stage.Icon;

  return (
    <div
      className="animate-chat-bubble-in pixel-card p-4 space-y-3"
      style={{ backgroundColor: "var(--card-bg)" }}
    >
      {/* Stage indicator */}
      <div className="flex items-center gap-2.5">
        <StageIcon size={18} color="var(--color-solar-orange)" />
        <span
          className="font-pixel text-[10px] font-medium transition-all duration-300"
          style={{ color: "var(--foreground)" }}
        >
          {stage.label}
        </span>
      </div>

      {/* Pixel progress bar */}
      <div className="pixel-progress w-full">
        <div
          className="pixel-progress-fill"
          style={{
            width: `${percent}%`,
            background: percent >= 100
              ? "var(--color-success)"
              : undefined,
          }}
        />
      </div>

      {/* Stage dots — pixel squares */}
      <div className="flex items-center justify-between px-1">
        {STAGES.map((s, i) => (
          <div
            key={i}
            className="w-2 h-2 transition-all duration-300"
            style={{
              backgroundColor: i <= currentStage
                ? (i === currentStage ? "var(--color-solar-orange)" : "var(--color-success)")
                : "var(--card-border)",
              transform: i === currentStage ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
