"use client";

import { useState } from "react";
import { LeafIcon, CheckIcon, FactoryIcon, TreeIcon, ClipboardIcon, DiamondIcon, LockIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

/**
 * CO₂ Certificate — Shareable pixel-art environmental impact diploma.
 * Full i18n support + simulated cNFT mint flow via Metaplex Bubblegum (demo).
 * All emojis replaced with pixel SVG icons.
 */
export default function Co2Certificate({
  co2Kg = 29.4,
  onClose,
}: {
  co2Kg?: number;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [mintState, setMintState] = useState<"idle" | "minting" | "minted">("idle");
  const [mintData, setMintData] = useState<{ assetId: string; explorerUrl: string } | null>(null);
  const { t } = useTranslation();

  const trees = (co2Kg / 21).toFixed(1);

  const handleShare = () => {
    const text = `${t("cert.title" as any)}\n━━━━━━━━━━━━━━━\nCO₂: ${co2Kg.toFixed(1)} kg\n${t("cert.trees_equiv" as any)}: ${trees}\n${t("cert.network" as any)}\n━━━━━━━━━━━━━━━\n#Lumos #EnergíaSolar`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMintNFT = async () => {
    setMintState("minting");
    await new Promise((r) => setTimeout(r, 1500));
    await new Promise((r) => setTimeout(r, 1200));
    await new Promise((r) => setTimeout(r, 800));

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const assetId = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 44);
    const explorerUrl = `https://explorer.solana.com/address/${assetId}?cluster=devnet`;

    setMintData({ assetId, explorerUrl });
    setMintState("minted");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div
        className="pixel-card p-6 w-full max-w-sm relative"
        style={{
          backgroundColor: "var(--card-bg)",
          border: `3px solid ${mintState === "minted" ? "var(--color-accent-violet)" : "var(--color-success)"}`,
          boxShadow: mintState === "minted"
            ? "0 0 30px rgba(139, 92, 246, 0.3)"
            : "0 0 30px rgba(34, 197, 94, 0.3)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 font-pixel text-[10px] cursor-pointer"
          style={{ color: "var(--foreground-secondary)" }}
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-2" style={{ backgroundColor: mintState === "minted" ? "var(--color-accent-violet)" : "var(--color-success)", color: "white" }}>
            <LeafIcon size={12} color="#FFF" />
            <span className="font-pixel text-[8px] font-bold">
              {mintState === "minted" ? t("cert.nft_cert" as any) : t("cert.title" as any).toUpperCase().slice(0, 12)}
            </span>
          </div>
          <h2 className="font-pixel text-[10px] font-bold" style={{ color: "var(--foreground)" }}>
            {t("cert.impact" as any)}
          </h2>
          <p className="font-pixel text-[7px] mt-1" style={{ color: "var(--foreground-secondary)" }}>
            Lumos · {t("cert.network" as any)}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center py-3 pixel-border" style={{ backgroundColor: "var(--background-secondary)", "--pixel-border-color": "var(--color-success)" } as React.CSSProperties}>
            <div className="flex justify-center mb-1"><FactoryIcon size={24} color="var(--color-success)" /></div>
            <div className="font-pixel text-[12px] font-bold" style={{ color: "var(--color-success)" }}>
              {co2Kg.toFixed(1)} kg
            </div>
            <div className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>{t("cert.avoided" as any)}</div>
          </div>
          <div className="text-center py-3 pixel-border" style={{ backgroundColor: "var(--background-secondary)", "--pixel-border-color": "var(--color-deep-green)" } as React.CSSProperties}>
            <div className="flex justify-center mb-1"><TreeIcon size={24} color="var(--color-deep-green)" /></div>
            <div className="font-pixel text-[12px] font-bold" style={{ color: "var(--color-deep-green)" }}>
              {trees}
            </div>
            <div className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>{t("cert.trees_equiv" as any)}</div>
          </div>
        </div>

        {/* NFT Metadata (shown after mint) */}
        {mintState === "minted" && mintData && (
          <div
            className="mb-4 p-3 space-y-2"
            style={{ backgroundColor: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.2)" }}
          >
            <div className="flex items-center gap-2">
              <DiamondIcon size={12} color="var(--color-accent-violet)" />
              <span className="font-pixel text-[8px] font-bold" style={{ color: "var(--color-accent-violet)" }}>
                {t("cert.compressed" as any)}
              </span>
              <span className="font-pixel text-[6px] px-1.5 py-0.5" style={{
                backgroundColor: "rgba(139, 92, 246, 0.2)",
                color: "var(--color-accent-violet)",
              }}>
                DEVNET
              </span>
            </div>
            <div className="font-pixel text-[6px] break-all" style={{ color: "var(--foreground-secondary)" }}>
              Asset: {mintData.assetId.slice(0, 8)}...{mintData.assetId.slice(-8)}
            </div>
            <a
              href={mintData.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-pixel text-[7px] transition-colors hover:opacity-80"
              style={{ color: "var(--color-accent-violet)" }}
            >
              <LockIcon size={8} color="var(--color-accent-violet)" />
              {t("cert.view_explorer" as any)} →
            </a>
            <div className="font-pixel text-[6px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Metaplex Bubblegum · Compressed NFT · Merkle Tree
            </div>
          </div>
        )}

        {/* Decorative border */}
        <div className="border-t-2 border-dashed mb-4" style={{ borderColor: "var(--card-border)" }} />

        {/* Actions */}
        <div className="space-y-2">
          {/* Mint as NFT button */}
          {mintState === "idle" && (
            <button
              onClick={handleMintNFT}
              className="w-full py-2 font-pixel text-[9px] font-bold transition-all cursor-pointer hover:brightness-110 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--color-accent-violet)",
                color: "white",
                boxShadow: "0 0 12px rgba(139, 92, 246, 0.3)",
              }}
            >
              <DiamondIcon size={12} color="#FFF" />
              {t("cert.mint_nft" as any)}
            </button>
          )}

          {/* Minting progress */}
          {mintState === "minting" && (
            <div className="w-full py-2.5 text-center">
              <div className="font-pixel text-[8px] animate-pulse flex items-center justify-center gap-2" style={{ color: "var(--color-accent-violet)" }}>
                <LockIcon size={10} color="var(--color-accent-violet)" />
                {t("cert.minting" as any)}
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden" style={{ backgroundColor: "rgba(139,92,246,0.1)" }}>
                <div
                  className="h-full"
                  style={{
                    backgroundColor: "var(--color-accent-violet)",
                    animation: "nft-mint-progress 3.5s ease-out forwards",
                  }}
                />
              </div>
              <style>{`
                @keyframes nft-mint-progress {
                  0% { width: 0%; }
                  30% { width: 35%; }
                  60% { width: 70%; }
                  100% { width: 100%; }
                }
              `}</style>
            </div>
          )}

          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-full py-2 font-pixel text-[9px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{
              backgroundColor: copied ? "var(--color-success)" : "var(--color-solar-orange)",
              color: "white",
            }}
          >
            {copied ? (
              <><CheckIcon size={10} color="#FFF" /> {t("cert.copied" as any)}</>
            ) : (
              <><ClipboardIcon size={12} color="#FFF" /> {t("cert.share_cert" as any)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
