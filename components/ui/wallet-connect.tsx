"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTranslation } from "@/lib/i18n";

/**
 * #13 Wallet Connect — Real Phantom integration via wallet-adapter.
 * Shows connect button when disconnected, address + balance when connected.
 * Handles WalletNotSelectedError by waiting for select() to settle before connect().
 */
export default function WalletConnect({ onShowQR }: { onShowQR?: () => void }) {
  const { publicKey, connected, connecting, connect, disconnect, select, wallets } = useWallet();
  const { connection } = useConnection();
  const { t } = useTranslation();

  const [balance, setBalance] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch SOL balance when connected
  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(null);
      return;
    }

    let cancelled = false;
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        if (!cancelled) setBalance(bal / LAMPORTS_PER_SOL);
      } catch {
        if (!cancelled) setBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connected, connection]);

  const handleConnect = useCallback(() => {
    // Find Phantom — could be registered as "Phantom" or via wallet-standard
    const phantom = wallets.find((w) =>
      w.adapter.name.toLowerCase().includes("phantom")
    ) || wallets[0]; // fallback to first available wallet

    if (phantom) {
      select(phantom.adapter.name);
      setTimeout(async () => {
        try {
          await connect();
        } catch (err) {
          console.warn("Wallet connect failed:", err);
        }
      }, 150);
    } else if (typeof window !== "undefined" && (window as any).phantom?.solana) {
      // Direct Phantom provider fallback
      (window as any).phantom.solana.connect().catch(console.warn);
    } else {
      window.open("https://phantom.app/", "_blank");
    }
  }, [wallets, select, connect]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setShowMenu(false);
  }, [disconnect]);

  const handleCopy = useCallback(() => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [publicKey]);

  const truncated = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  // Disconnected state
  if (!connected && !connecting) {
    return (
      <button
        onClick={handleConnect}
        className="px-3.5 py-2 font-pixel text-[10px] font-bold cursor-pointer transition-all hover:opacity-90"
        style={{
          backgroundColor: "var(--color-accent-violet)",
          color: "white",
          border: "2px solid rgba(168, 85, 247, 0.5)",
        }}
      >
        🔗 {t("wallet.connect")}
      </button>
    );
  }

  // Connecting state
  if (connecting) {
    return (
      <div
        className="px-3.5 py-2 font-pixel text-[10px]"
        style={{ color: "var(--color-accent-violet)" }}
      >
        <span className="inline-block animate-pulse">⟳</span> {t("wallet.connecting")}
      </div>
    );
  }

  // Connected state
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-3 py-2 font-pixel text-[9px] cursor-pointer flex items-center gap-2 transition-all hover:opacity-90"
        style={{
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          border: "1px solid var(--color-success)",
          color: "var(--color-success)",
        }}
      >
        <span className="w-2 h-2 inline-block" style={{ backgroundColor: "var(--color-success)" }} />
        {truncated}
        {balance !== null && (
          <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>
            {balance.toFixed(2)} SOL
          </span>
        )}
      </button>

      {showMenu && (
        <div
          className="absolute right-0 top-full mt-1 w-44 pixel-card overflow-hidden z-50"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "2px solid var(--card-border)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {/* Full address */}
          <div
            className="px-3 py-2 font-pixel text-[6px] break-all"
            style={{ color: "var(--foreground-secondary)", borderBottom: "1px solid var(--card-border)" }}
          >
            {publicKey?.toBase58()}
          </div>

          {/* Balance */}
          {balance !== null && (
            <div
              className="px-3 py-2 font-pixel text-[8px] flex justify-between"
              style={{ color: "var(--foreground)", borderBottom: "1px solid var(--card-border)" }}
            >
              <span>Balance:</span>
              <span style={{ color: "var(--color-solar-yellow)" }}>{balance.toFixed(4)} SOL</span>
            </div>
          )}

          {/* Copy address */}
          <button
            onClick={handleCopy}
            className="w-full px-3 py-2 text-left font-pixel text-[8px] cursor-pointer transition-colors hover:opacity-80"
            style={{ color: "var(--foreground)", borderBottom: "1px solid var(--card-border)" }}
          >
            {copied ? `✅ ${t("wallet.copied")}` : `📋 ${t("wallet.copy")}`}
          </button>

          {/* QR option */}
          {onShowQR && (
            <button
              onClick={() => { onShowQR(); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left font-pixel text-[8px] cursor-pointer transition-colors hover:opacity-80"
              style={{ color: "var(--foreground)", borderBottom: "1px solid var(--card-border)" }}
            >
              📱 {t("wallet.qr")}
            </button>
          )}

          {/* Explorer link */}
          <a
            href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 text-left font-pixel text-[8px] cursor-pointer transition-colors hover:opacity-80"
            style={{ color: "var(--color-solar-orange)", borderBottom: "1px solid var(--card-border)" }}
          >
            🔍 Explorer →
          </a>

          {/* Disconnect */}
          <button
            onClick={handleDisconnect}
            className="w-full px-3 py-2 text-left font-pixel text-[8px] cursor-pointer transition-colors hover:opacity-80"
            style={{ color: "var(--color-error)" }}
          >
            🔌 {t("wallet.disconnect")}
          </button>
        </div>
      )}
    </div>
  );
}
