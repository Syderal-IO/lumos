"use client";

import { BoltIcon, CheckIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

/**
 * #8 Activity Sidebar — Recent transaction mini-panel for the chat view.
 */
const RECENT_ACTIVITY = [
  { hash: "GL-4F2A", amount: 0.25, time: "2h", type: "venta" },
  { hash: "GL-3E1B", amount: 0.18, time: "1d", type: "venta" },
  { hash: "GL-2D0A", amount: 0.32, time: "2d", type: "venta" },
];

export default function ActivitySidebar() {
  const total = RECENT_ACTIVITY.reduce((s, a) => s + a.amount, 0);
  const { t } = useTranslation();

  return (
    <div
      className="hidden lg:flex flex-col w-56 shrink-0"
      style={{ borderLeft: "2px solid var(--card-border)", backgroundColor: "var(--card-bg)" }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 flex items-center gap-2"
        style={{ borderBottom: "2px solid var(--card-border)" }}
      >
        <span className="w-2 h-2 animate-pulse" style={{ backgroundColor: "var(--color-success)" }} />
        <span className="font-pixel text-[8px]" style={{ color: "var(--foreground)" }}>
          {t("activity.recent")}
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {RECENT_ACTIVITY.map((item) => (
          <div
            key={item.hash}
            className="px-3 py-2.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--card-border)" }}
          >
            <div className="flex items-center gap-2">
              <CheckIcon size={8} color="var(--color-success)" />
              <span className="font-pixel text-[8px]" style={{ color: "var(--foreground)" }}>
                {item.hash}
              </span>
            </div>
            <span className="font-pixel text-[8px] font-bold" style={{ color: "var(--color-solar-orange)" }}>
              +${item.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-3 py-2.5 flex justify-between" style={{ borderTop: "2px solid var(--card-border)" }}>
        <span className="font-pixel text-[8px]" style={{ color: "var(--foreground-secondary)" }}>
          {t("activity.total")}
        </span>
        <span className="font-pixel text-[8px] font-bold counter-glow" style={{ color: "var(--color-solar-orange)" }}>
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
