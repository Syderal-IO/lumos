"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

/**
 * Solana Wallet Provider — wraps the app with ConnectionProvider + WalletProvider.
 * Uses Devnet by default, configurable via env.
 * 
 * Modern wallets (Phantom, Solflare, etc.) auto-register via wallet-standard.
 * No legacy adapters needed — the WalletProvider detects them automatically.
 */
export default function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet"),
    []
  );

  // Empty array — wallet-standard adapters auto-register
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
