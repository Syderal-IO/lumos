// ═══════════════════════════════════════════════
// Lumos — IoT Delivery Simulator
// Simulates the meter confirmation after energy delivery.
// In production: replaced by real smart meter signals.
// ═══════════════════════════════════════════════

import { confirmDeliveryServer, collectFeeServer } from "./solana-server";

const DELIVERY_DELAY_MS = 5000; // 5 seconds for demo

interface DeliveryResult {
  confirmTxHash: string;
  feeTxHash: string;
  kwhDelivered: number;
  timestamp: string;
}

/**
 * Simulate IoT meter confirmation of energy delivery.
 * - Waits 5 seconds (simulating physical energy transfer)
 * - Calls confirm_delivery on-chain
 * - Calls collect_fee on-chain
 * - Returns all transaction hashes
 */
export async function simulateDeliveryConfirmation(
  vaultPda: string,
  expectedKwh: number,
  onProgress?: (stage: string, percent: number) => void
): Promise<DeliveryResult> {
  // Stage 1: Simulating energy transfer
  onProgress?.("Transfiriendo energía...", 20);
  await delay(DELIVERY_DELAY_MS * 0.4);

  // Stage 2: Reading meter
  onProgress?.("Leyendo medidor...", 45);
  await delay(DELIVERY_DELAY_MS * 0.3);

  // Stage 3: Confirming delivery on-chain
  onProgress?.("Confirmando entrega...", 70);
  const { txHash: confirmTxHash } = await confirmDeliveryServer(vaultPda, expectedKwh);
  await delay(DELIVERY_DELAY_MS * 0.2);

  // Stage 4: Collecting protocol fee
  onProgress?.("Procesando pago...", 90);
  const { txHash: feeTxHash } = await collectFeeServer(vaultPda);

  // Stage 5: Complete
  onProgress?.("✓ Transacción completada", 100);

  return {
    confirmTxHash,
    feeTxHash,
    kwhDelivered: expectedKwh,
    timestamp: new Date().toISOString(),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
