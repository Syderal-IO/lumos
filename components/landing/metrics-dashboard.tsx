"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { SunIcon, LeafIcon, BoltIcon, ChartIcon } from "@/components/ui/pixel-icons";

interface Metric {
  labelKey: string;
  value: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const METRICS: Metric[] = [
  {
    labelKey: "landing.metrics_energy",
    value: 110.5,
    suffix: " kWh",
    decimals: 1,
    icon: <SunIcon size={20} color="#F97316" />,
    color: "#F97316",
    description: "Solar generada",
  },
  {
    labelKey: "landing.metrics_co2",
    value: 48.6,
    suffix: " kg",
    decimals: 1,
    icon: <LeafIcon size={20} color="#22C55E" />,
    color: "#22C55E",
    description: "Impacto ambiental",
  },
  {
    labelKey: "landing.metrics_trades",
    value: 45,
    suffix: "",
    decimals: 0,
    icon: <BoltIcon size={20} color="#FBBF24" />,
    color: "#FBBF24",
    description: "Transacciones P2P",
  },
  {
    labelKey: "landing.metrics_vs",
    value: 5.2,
    suffix: "x",
    decimals: 1,
    icon: <ChartIcon size={20} color="#A78BFA" />,
    color: "#A78BFA",
    description: "Ahorro vs tarifa",
  },
];

function AnimatedCounter({
  value,
  suffix,
  prefix = "",
  decimals = 0,
  color,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
  color: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const animate = useCallback(() => {
    const duration = 2000;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  useEffect(() => {
    if (!ref.current || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          animate();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div ref={ref}>
      <div
        className="font-pixel text-2xl sm:text-3xl font-bold counter-glow"
        style={{ color }}
      >
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </div>
    </div>
  );
}

export default function MetricsDashboard() {
  const { t } = useTranslation();

  return (
    <section className="py-28 px-6 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 font-pixel text-[9px] pixel-border"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              "--pixel-border-color": "rgba(34, 197, 94, 0.3)",
              color: "#22C55E",
            } as React.CSSProperties}
          >
            <span className="w-2 h-2 bg-green-400 animate-pulse" />
            {t("landing.metrics_badge" as any)}
          </div>
          <h2
            className="font-pixel text-xl md:text-2xl font-bold"
            style={{
              color: "white",
              textShadow: "0 0 30px rgba(34,197,94,0.2)",
            }}
          >
            {t("landing.metrics_title_1" as any)}{" "}
            <span style={{ color: "#22C55E" }}>
              {t("landing.metrics_title_2" as any)}
            </span>
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {METRICS.map((m, i) => (
            <div
              key={m.labelKey}
              className="pixel-card fresnel-card p-6 relative overflow-hidden group"
              style={{
                backgroundColor: `${m.color}08`,
                animationDelay: `${i * 100}ms`,
              }}
            >
              {/* Top accent */}
              <div
                className="absolute top-0 left-0 w-full h-0.5"
                style={{
                  background: `linear-gradient(90deg, ${m.color}, transparent)`,
                }}
              />

              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <div
                  className="w-10 h-10 flex items-center justify-center pixel-border transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${m.color}15`,
                    "--pixel-border-color": m.color,
                  } as React.CSSProperties}
                >
                  {m.icon}
                </div>
              </div>

              {/* Value */}
              <div className="text-center mb-2">
                <AnimatedCounter
                  value={m.value}
                  suffix={m.suffix}
                  prefix={m.prefix}
                  decimals={m.decimals}
                  color={m.color}
                />
              </div>

              {/* Label */}
              <div
                className="font-pixel text-[10px] text-center uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {t(m.labelKey as any)}
              </div>

              {/* Subtle bottom glow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${m.color}40, transparent)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span
            className="font-pixel text-[9px] uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Solana Devnet
          </span>
        </div>
      </div>
    </section>
  );
}
