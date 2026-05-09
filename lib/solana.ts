// ═══════════════════════════════════════════════
// Lumos — Solana Client (NexusVault)
// Handles all on-chain interactions via @solana/web3.js
// For hackathon demo: simulates tx flow when program not deployed
// ═══════════════════════════════════════════════

import {
  Connection,
  PublicKey,
} from "@solana/web3.js";
import type { VaultState } from "./types";

// ─── Configuration ───

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = process.env.NEXT_PUBLIC_NEXUSVAULT_PROGRAM_ID || "";
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

let _connection: Connection | null = null;

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(RPC_URL, "confirmed");
  }
  return _connection;
}

// ─── UI Utilities ───

export function getExplorerUrl(txHash: string): string {
  if (txHash.startsWith("sim_")) {
    return `https://explorer.solana.com/?cluster=devnet`; 
  }
  return `https://explorer.solana.com/tx/${txHash}?cluster=${NETWORK}`;
}

export function isSimulated(): boolean {
  return !PROGRAM_ID;
}

