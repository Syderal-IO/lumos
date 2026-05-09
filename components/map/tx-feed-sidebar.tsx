"use client";

import { useEffect, useState } from "react";
import { BoltIcon, CheckIcon, XIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

interface FeedItem {
  id: string;
  hash: string;
  amount: number;
  kwh: number;
  status: "pending" | "confirmed" | "failed";
  timestamp: string;
  buyerName: string;
}

/**
 * Transaction feed sidebar — Pixel art styled with pixel frames.
 */
export default function TxFeedSidebar() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const demoItems: FeedItem[] = [
      { id: "1", hash: "GL-4F2A", amount: 0.25, kwh: 2.8, status: "confirmed", timestamp: new Date(Date.now() - 2000).toISOString(), buyerName: "Vecino A" },
      { id: "2", hash: "GL-3E1B", amount: 0.18, kwh: 2.0, status: "confirmed", timestamp: new Date(Date.now() - 30000).toISOString(), buyerName: "Vecino C" },
      { id: "3", hash: "GL-2D0A", amount: 0.32, kwh: 3.5, status: "confirmed", timestamp: new Date(Date.now() - 120000).toISOString(), buyerName: "Vecino B" },
    ];
    setItems(demoItems);
  }, []);

  function timeAgo(timestamp: string): string {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 5) return t("map.now");
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }

  return (
    <div
      className="w-[220px] h-full flex flex-col overflow-hidden shrink-0"
      style={{
        background: "var(--card-bg)",
        borderLeft: "2px solid var(--card-border)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-3 flex items-center gap-2"
        style={{
          borderBottom: "2px solid var(--card-border)",
          background: "rgba(16, 185, 129, 0.06)",
        }}
      >
        <span className="w-2 h-2 animate-pulse" style={{ backgroundColor: "var(--color-success)" }} />
        <span className="font-pixel text-[9px]" style={{ color: "var(--foreground)" }}>
          {t("map.tx_live")}
        </span>
      </div>

      {/* Feed items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-3 py-6 font-pixel text-[9px] text-center" style={{ color: "var(--foreground-secondary)" }}>
            {t("map.no_tx")}
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              className="px-3 py-3 animate-slide-in-right"
              style={{
                borderBottom: "2px solid var(--card-border)",
                animationDelay: `${i * 100}ms`,
                animationFillMode: "both",
              }}
            >
              {/* Hash + Amount */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-pixel text-[9px] font-bold" style={{ color: "var(--foreground)" }}>
                  {item.hash}
                </span>
                <span className="font-pixel text-[9px] font-bold" style={{ color: "var(--color-solar-yellow)" }}>
                  ${item.amount.toFixed(2)}
                </span>
              </div>

              {/* Status + Time */}
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1">
                  {item.status === "confirmed" ? (
                    <>
                      <CheckIcon size={10} color="var(--color-success)" />
                      <span className="text-[10px]" style={{ color: "var(--color-success)" }}>OK</span>
                    </>
                  ) : item.status === "pending" ? (
                    <span className="text-[10px]" style={{ color: "var(--color-warning)" }}>...</span>
                  ) : (
                    <>
                      <XIcon size={10} color="var(--color-error)" />
                      <span className="text-[10px]" style={{ color: "var(--color-error)" }}>FAIL</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] font-pixel" style={{ color: "var(--foreground-secondary)" }}>
                  {timeAgo(item.timestamp)}
                </span>
              </div>

              {/* kWh + Buyer */}
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--foreground-secondary)" }}>
                <BoltIcon size={10} color="var(--color-solar-orange)" />
                <span>{item.kwh} kWh</span>
                <span>→</span>
                <span>{item.buyerName}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer stats */}
      <div
        className="px-3 py-2.5"
        style={{
          borderTop: "2px solid var(--card-border)",
          background: "rgba(16, 185, 129, 0.06)",
        }}
      >
        <div className="flex justify-between">
          <span className="font-pixel text-[9px]" style={{ color: "var(--foreground-secondary)" }}>{t("map.total_today")}</span>
          <span className="font-pixel text-[9px] font-bold" style={{ color: "var(--color-solar-yellow)" }}>
            ${items.reduce((s, i) => s + i.amount, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
