"use client";

import { SunIcon } from "@/components/ui/pixel-icons";

/**
 * #8 Leaderboard — Top 5 neighborhood sellers with pixel avatars.
 */
const SELLERS = [
  { name: "Casa Morales", kWh: 48.2, earnings: 4.34, you: false },
  { name: "Familia Quesada", kWh: 35.7, earnings: 3.21, you: false },
  { name: "Tu Casa", kWh: 28.4, earnings: 2.56, you: true },
  { name: "Residencia Arce", kWh: 21.1, earnings: 1.90, you: false },
  { name: "Casa Villalobos", kWh: 12.8, earnings: 1.15, you: false },
];

const RANK_COLORS = ["#FBBF24", "#9CA3AF", "#CD7F32", "var(--foreground-secondary)", "var(--foreground-secondary)"];

export default function Leaderboard() {
  return (
    <div className="space-y-1.5">
      {SELLERS.map((s, i) => (
        <div
          key={s.name}
          className="flex items-center gap-2 px-2.5 py-2 transition-all"
          style={{
            backgroundColor: s.you ? "rgba(249, 115, 22, 0.1)" : "transparent",
            border: s.you ? "1px solid rgba(249, 115, 22, 0.3)" : "1px solid transparent",
          }}
        >
          {/* Rank */}
          <span
            className="font-pixel text-[10px] font-bold w-5 text-center shrink-0"
            style={{ color: RANK_COLORS[i] }}
          >
            {i === 0 ? "👑" : `#${i + 1}`}
          </span>

          {/* Avatar */}
          <div
            className="w-6 h-6 flex items-center justify-center shrink-0 pixel-border"
            style={{
              backgroundColor: s.you ? "var(--color-solar-orange)" : "var(--background-secondary)",
              "--pixel-border-color": s.you ? "var(--color-solar-yellow)" : "var(--card-border)",
            } as React.CSSProperties}
          >
            <SunIcon size={12} color={s.you ? "#FFF" : "var(--foreground-secondary)"} />
          </div>

          {/* Name */}
          <span
            className="font-pixel text-[7px] flex-1 truncate"
            style={{ color: s.you ? "var(--color-solar-orange)" : "var(--foreground)" }}
          >
            {s.name}
          </span>

          {/* Stats */}
          <div className="text-right shrink-0">
            <div className="font-pixel text-[8px] font-bold" style={{ color: "var(--color-solar-orange)" }}>
              ${s.earnings.toFixed(2)}
            </div>
            <div className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>
              {s.kWh} kWh
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
