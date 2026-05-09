// ═══════════════════════════════════════════════
// Lumos — Solana Server-Side Client
// Handles sensitive transaction signing and protocol wallet logic
// ═══════════════════════════════════════════════

import "server-only";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import type { VaultState } from "./types";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = process.env.NEXUSVAULT_PROGRAM_ID || "";

let _connection: Connection | null = null;
let _protocolWallet: Keypair | null = null;

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(RPC_URL, "confirmed");
  }
  return _connection;
}

export function getProtocolWallet(): Keypair | null {
  if (_protocolWallet) return _protocolWallet;
  const key = process.env.SOLANA_PRIVATE_KEY;
  if (!key) return null;
  try {
    const decoded = Buffer.from(key, "base64");
    _protocolWallet = Keypair.fromSecretKey(decoded);
    return _protocolWallet;
  } catch {
    return null;
  }
}

// ─── Vault Logic ───

export function deriveVaultPDA(
  prosumerPubkey: PublicKey,
  buyerPubkey: PublicKey
): [PublicKey, number] {
  if (!PROGRAM_ID) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("nexus-vault"), prosumerPubkey.toBuffer(), buyerPubkey.toBuffer()],
      SystemProgram.programId
    );
  }

  return PublicKey.findProgramAddressSync(
    [Buffer.from("nexus-vault"), prosumerPubkey.toBuffer(), buyerPubkey.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );
}

// ─── Simulation Store (Server-only) ───
const vaultStore = new Map<string, { state: VaultState; txHashes: Record<string, string> }>();

export async function initializeVaultServer(
  prosumerId: string,
  buyerId: string,
  kwhAmount: number,
  pricePerKwh: number
): Promise<{ txHash: string; vaultPda: string }> {
  const connection = getConnection();
  const wallet = getProtocolWallet();

  const totalUsdc = kwhAmount * pricePerKwh;
  const now = Math.floor(Date.now() / 1000);

  let txHash = `sim_init_${Date.now().toString(36)}`;
  if (wallet) {
    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 1,
        })
      );
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = wallet.publicKey;
      tx.sign(wallet);
      txHash = await connection.sendRawTransaction(tx.serialize());
    } catch (e) {
      console.error("Server init tx failed:", e);
    }
  }

  const vaultPda = `vault_${prosumerId}_${buyerId}_${Date.now().toString(36)}`;
  vaultStore.set(vaultPda, {
    state: {
      prosumer: prosumerId,
      buyer: buyerId,
      kwhAmount,
      pricePerKwh,
      totalUsdc: Math.round(totalUsdc * 1e6),
      feeUsdc: Math.round(totalUsdc * 0.001 * 1e6),
      status: "Initialized",
      createdAt: now,
      timeoutAt: now + 900,
    },
    txHashes: { init: txHash },
  });

  return { txHash, vaultPda };
}

export async function lockFundsServer(vaultPda: string): Promise<{ txHash: string }> {
  const vault = vaultStore.get(vaultPda);
  if (!vault) throw new Error("Vault not found");

  vault.state.status = "FundsLocked";
  const txHash = `sim_lock_${Date.now().toString(36)}`;
  vault.txHashes.lock = txHash;

  return { txHash };
}

export async function confirmDeliveryServer(
  vaultPda: string,
  kwhDelivered: number
): Promise<{ txHash: string }> {
  const vault = vaultStore.get(vaultPda);
  if (!vault) throw new Error("Vault not found");

  vault.state.status = "DeliveryConfirmed";
  vault.state.meterReading = {
    meterId: "METER-GL-001",
    kwhDelivered,
    timestamp: Math.floor(Date.now() / 1000),
    source: "mock",
  };

  const txHash = `sim_confirm_${Date.now().toString(36)}`;
  vault.txHashes.confirm = txHash;

  return { txHash };
}

export async function collectFeeServer(vaultPda: string): Promise<{ txHash: string }> {
  const vault = vaultStore.get(vaultPda);
  if (!vault) throw new Error("Vault not found");

  vault.state.status = "Completed";
  const txHash = `sim_fee_${Date.now().toString(36)}`;
  vault.txHashes.fee = txHash;

  return { txHash };
}
