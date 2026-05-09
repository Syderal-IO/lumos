"use client";

import { useState, useEffect, useCallback } from "react";
import { SunIcon, BoltIcon, HomeIcon, LeafIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

/**
 * SimulationModal — Animated walkthrough of the Solei energy trading flow.
 * Fully i18n — supports ES and EN via translation keys.
 * Shows a step-by-step visual simulation: panels generate → surplus detected →
 * buyer matched → trade proposed → transaction confirmed.
 */

interface SimStep {
  id: number;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  color: string;
  dataKeys: { labelKey: string; value: string }[];
}

const STEPS: SimStep[] = [
  {
    id: 0,
    titleKey: "sim.step0_title",
    descKey: "sim.step0_desc",
    icon: <SunIcon size={28} color="#FBBF24" />,
    color: "#FBBF24",
    dataKeys: [
      { labelKey: "sim.step0_d0", value: "4.4 kWh" },
      { labelKey: "sim.step0_d1", value: "0.6 kWh" },
    ],
  },
  {
    id: 1,
    titleKey: "sim.step1_title",
    descKey: "sim.step1_desc",
    icon: <BoltIcon size={28} color="#F97316" />,
    color: "#F97316",
    dataKeys: [
      { labelKey: "sim.step1_d0", value: "3.8 kWh" },
      { labelKey: "sim.step1_d1", value: "$0.089/kWh" },
    ],
  },
  {
    id: 2,
    titleKey: "sim.step2_title",
    descKey: "sim.step2_desc",
    icon: <HomeIcon size={28} color="#22C55E" />,
    color: "#22C55E",
    dataKeys: [
      { labelKey: "sim.step2_d0", value: "Vecino C — Moravia" },
      { labelKey: "sim.step2_d1", value: "1.01 kWh" },
    ],
  },
  {
    id: 3,
    titleKey: "sim.step3_title",
    descKey: "sim.step3_desc",
    icon: <LeafIcon size={28} color="#10B981" />,
    color: "#10B981",
    dataKeys: [
      { labelKey: "sim.step3_d0", value: "1.01 kWh" },
      { labelKey: "sim.step3_d1", value: "$0.09 USDC" },
      { labelKey: "sim.step3_d2", value: "0.001%" },
    ],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGoToChat: () => void;
}

export default function SimulationModal({ isOpen, onClose, onGoToChat }: Props) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { t } = useTranslation();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(-1);
      setIsRunning(false);
      setCompleted(false);
    }
  }, [isOpen]);

  // Auto-advance steps
  useEffect(() => {
    if (!isRunning || currentStep >= STEPS.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length - 1) {
          setIsRunning(false);
          setCompleted(true);
        }
        return next;
      });
    }, 5200);

    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  const handleStart = useCallback(() => {
    setCurrentStep(0);
    setIsRunning(true);
    setCompleted(false);
  }, []);

  if (!isOpen) return null;

  const activeStep = currentStep >= 0 ? STEPS[currentStep] : null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        className="pixel-card w-full max-w-xl relative max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.98)",
          border: "2px solid var(--color-solar-orange)",
          boxShadow: "0 0 60px rgba(249,115,22,0.15), 0 20px 60px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 sticky top-0 z-10"
          style={{
            borderBottom: "2px solid var(--card-border)",
            backgroundColor: "rgba(15, 23, 42, 0.98)",
          }}
        >
          <div className="flex items-center gap-2">
            <SunIcon size={18} color="var(--color-solar-orange)" />
            <span className="font-pixel text-[11px] font-bold" style={{ color: "var(--color-solar-orange)" }}>
              {t("sim.header")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-[10px] px-2 py-1 cursor-pointer hover:opacity-70"
            style={{ color: "var(--foreground-secondary)" }}
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 px-5 pt-4">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className="flex-1 h-1.5 transition-all duration-500"
              style={{
                backgroundColor:
                  i <= currentStep
                    ? STEPS[Math.min(i, STEPS.length - 1)].color
                    : "rgba(255,255,255,0.08)",
                boxShadow: i <= currentStep ? `0 0 6px ${STEPS[i].color}40` : "none",
              }}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="px-5 py-6 min-h-[220px] flex flex-col items-center justify-center">
          {currentStep < 0 ? (
            /* Start screen */
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div
                  className="w-16 h-16 flex items-center justify-center pixel-border"
                  style={{
                    backgroundColor: "rgba(249,115,22,0.15)",
                    "--pixel-border-color": "var(--color-solar-orange)",
                  } as React.CSSProperties}
                >
                  <SunIcon size={36} color="var(--color-solar-orange)" />
                </div>
              </div>
              <div>
                <h3 className="font-pixel text-sm mb-2" style={{ color: "var(--foreground)" }}>
                  {t("sim.how")}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                  {t("sim.intro")}
                </p>
              </div>
              <button
                onClick={handleStart}
                className="px-6 py-3 font-pixel text-[11px] font-bold cursor-pointer transition-all hover:brightness-110 pixel-border"
                style={{
                  backgroundColor: "var(--color-solar-orange)",
                  color: "white",
                  "--pixel-border-color": "#FBBF24",
                } as React.CSSProperties}
              >
                {t("sim.start")}
              </button>
            </div>
          ) : activeStep ? (
            /* Active step */
            <div className="w-full animate-fade-in-up" key={activeStep.id}>
              {/* Step icon + title */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 flex items-center justify-center pixel-border flex-shrink-0"
                  style={{
                    backgroundColor: `${activeStep.color}20`,
                    "--pixel-border-color": activeStep.color,
                    boxShadow: `0 0 16px ${activeStep.color}30`,
                  } as React.CSSProperties}
                >
                  {activeStep.icon}
                </div>
                <div>
                  <div className="font-pixel text-[7px] mb-0.5" style={{ color: "var(--foreground-secondary)" }}>
                    {t("sim.step")} {activeStep.id + 1} {t("sim.of")} {STEPS.length}
                  </div>
                  <h3 className="font-pixel text-xs font-bold" style={{ color: activeStep.color }}>
                    {t(activeStep.titleKey as any)}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--foreground-secondary)" }}>
                {t(activeStep.descKey as any)}
              </p>

              {/* Data rows */}
              {activeStep.dataKeys && (
                <div className="space-y-2">
                  {activeStep.dataKeys.map((d) => (
                    <div
                      key={d.labelKey}
                      className="flex items-center justify-between px-3 py-2"
                      style={{
                        backgroundColor: `${activeStep.color}08`,
                        border: `1px solid ${activeStep.color}20`,
                      }}
                    >
                      <span className="font-pixel text-[8px]" style={{ color: "var(--foreground-secondary)" }}>
                        {t(d.labelKey as any)}
                      </span>
                      <span className="font-pixel text-[10px] font-bold" style={{ color: activeStep.color }}>
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Animated connection line to next step */}
              {isRunning && currentStep < STEPS.length - 1 && (
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-1">
                    <span className="animate-bounce font-pixel text-[8px]" style={{ color: activeStep.color, animationDelay: "0ms" }}>●</span>
                    <span className="animate-bounce font-pixel text-[8px]" style={{ color: activeStep.color, animationDelay: "200ms" }}>●</span>
                    <span className="animate-bounce font-pixel text-[8px]" style={{ color: activeStep.color, animationDelay: "400ms" }}>●</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Completed state */}
          {completed && (
            <div className="w-full mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid var(--card-border)" }}>
              <div className="text-center">
                <span className="font-pixel text-[9px]" style={{ color: "#10B981" }}>
                  {t("sim.completed")}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleStart}
                  className="flex-1 py-2.5 font-pixel text-[9px] cursor-pointer transition-all hover:opacity-80"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "var(--foreground-secondary)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  {t("sim.repeat")}
                </button>
                <button
                  onClick={onGoToChat}
                  className="flex-1 py-2.5 font-pixel text-[9px] font-bold cursor-pointer transition-all hover:brightness-110 pixel-border"
                  style={{
                    backgroundColor: "var(--color-deep-green)",
                    color: "white",
                    "--pixel-border-color": "#22C55E",
                  } as React.CSSProperties}
                >
                  {t("sim.try_solei")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
