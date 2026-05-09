"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/stores";
import { CheckIcon, BoltIcon } from "@/components/ui/pixel-icons";
import { exportDemoCSV } from "@/lib/export-csv";
import { useTranslation } from "@/lib/i18n";

/**
 * TradeHistory — Shows completed trades with real Solana Explorer links.
 * Merges Zustand store transactions with demo seed data.
 */

// Realistic demo trades for when the store is empty
const DEMO_TRADES = [
  {
    id: "demo-1",
    hash: "4Fz9xR...7vQp",
    fullHash: "",
    kwh: 2.8,
    usdc: 0.25,
    buyer: "Vecino C",
    time: "2h",
    isReal: false,
  },
  {
    id: "demo-2",
    hash: "3EbW1k...9mNx",
    fullHash: "",
    kwh: 2.0,
    usdc: 0.18,
    buyer: "Vecino A",
    time: "1d",
    isReal: false,
  },
  {
    id: "demo-3",
    hash: "2DaY0j...5pLw",
    fullHash: "",
    kwh: 3.5,
    usdc: 0.32,
    buyer: "Vecino D",
    time: "2d",
    isReal: false,
  },
  {
    id: "demo-4",
    hash: "1CzX9i...4oKv",
    fullHash: "",
    kwh: 1.5,
    usdc: 0.14,
    buyer: "Vecino B",
    time: "3d",
    isReal: false,
  },
];

export default function TradeHistory() {
  const storeTransactions = useTransactionStore((s) => s.transactions);
  const { t } = useTranslation();

  // Merge real transactions (if any) with demo data
  const allTrades = useMemo(() => {
    const real = storeTransactions.map((tx) => ({
      id: tx.id,
      hash: tx.txHash.startsWith("sim_")
        ? `GL-${tx.txHash.slice(-6).toUpperCase()}`
        : `${tx.txHash.slice(0, 6)}...${tx.txHash.slice(-4)}`,
      fullHash: tx.txHash,
      kwh: tx.kwhDelivered,
      usdc: tx.netUsdc,
      buyer: tx.buyerId,
      time: getRelativeTime(tx.createdAt),
      isReal: !tx.txHash.startsWith("sim_"),
    }));

    return [...real, ...DEMO_TRADES];
  }, [storeTransactions]);

  return (
    <div
      className="pixel-card card-enter overflow-hidden"
      style={{ backgroundColor: "var(--card-bg)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: "2px solid var(--card-border)" }}
      >
        <BoltIcon size={14} color="var(--color-solar-orange)" />
        <span
          className="font-pixel text-[9px] font-semibold section-title-glow"
          style={{ color: "var(--foreground)" }}
        >
          {t("stats.history")}
        </span>

        {/* Live indicator if real transactions exist */}
        {storeTransactions.length > 0 && (
          <span
            className="ml-1 px-1.5 py-0.5 font-pixel text-[6px]"
            style={{
              backgroundColor: "rgba(34,197,94,0.15)",
              color: "var(--color-success)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            {storeTransactions.length} ON-CHAIN
          </span>
        )}

        <button
          onClick={exportDemoCSV}
          className="ml-auto font-pixel text-[7px] px-2 py-1 cursor-pointer transition-all hover:brightness-110"
          style={{
            backgroundColor: "var(--background-secondary)",
            color: "var(--foreground-secondary)",
          }}
        >
          📥 {t("stats.export_csv")}
        </button>
      </div>

      {/* Transaction rows */}
      {allTrades.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between px-4 py-2.5 transition-colors hover:brightness-110"
          style={{ borderBottom: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-3">
            <CheckIcon size={10} color="var(--color-success)" />
            <div className="flex flex-col">
              {tx.isReal && tx.fullHash ? (
                <a
                  href={`https://explorer.solana.com/tx/${tx.fullHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-pixel text-[9px] font-semibold hover:underline"
                  style={{ color: "var(--color-solar-orange)" }}
                >
                  {tx.hash} ↗
                </a>
              ) : (
                <span
                  className="font-pixel text-[9px] font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {tx.hash}
                </span>
              )}
              <span
                className="font-pixel text-[6px]"
                style={{ color: "var(--foreground-secondary)" }}
              >
                {tx.buyer} • {tx.kwh} kWh
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span
              className="font-pixel text-[9px] font-semibold neon-text"
              style={{ color: "var(--color-solar-orange)" }}
            >
              ${tx.usdc.toFixed(2)}
            </span>
            <span
              className="font-pixel text-[7px]"
              style={{ color: "var(--foreground-secondary)" }}
            >
              {tx.time}
            </span>
          </div>
        </div>
      ))}

      {/* Footer: Solana network badge */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ backgroundColor: "rgba(153,69,255,0.05)" }}
      >
        <span
          className="font-pixel text-[6px]"
          style={{ color: "var(--foreground-secondary)" }}
        >
          Solana Devnet
        </span>
        <a
          href="https://explorer.solana.com/?cluster=devnet"
          target="_blank"
          rel="noopener noreferrer"
          className="font-pixel text-[7px] hover:underline"
          style={{ color: "var(--color-accent-violet)" }}
        >
          Explorer →
        </a>
      </div>
    </div>
  );
}

function getRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
