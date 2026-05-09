// ═══════════════════════════════════════════════
// Lumos — POST /api/transaction/authorize
// Executes the full on-chain trade flow:
//   initialize_vault → lock_funds → start IoT sim
// Source: 002-ARCHITECTURE.md §6
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { initializeVaultServer, lockFundsServer } from "@/lib/solana-server";
import { getExplorerUrl, isSimulated } from "@/lib/solana";
import { simulateDeliveryConfirmation } from "@/lib/iot-simulator";
import { CO2_FACTOR_KG_PER_KWH, PROTOCOL_FEE_RATE } from "@/lib/mock-data";

interface AuthorizeRequest {
  session_id: string;
  proposal: {
    prosumer_id: string;
    buyer_id: string;
    kwh_amount: number;
    price_per_kwh: number;
    total_usdc: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AuthorizeRequest = await request.json();

    if (!body.session_id || !body.proposal) {
      return NextResponse.json(
        { error: "session_id and proposal required" },
        { status: 400 }
      );
    }

    const { prosumer_id, buyer_id, kwh_amount, price_per_kwh, total_usdc } =
      body.proposal;

    // Step 1: Initialize vault (create escrow PDA)
    const { txHash: initTxHash, vaultPda } = await initializeVaultServer(
      prosumer_id,
      buyer_id,
      kwh_amount,
      price_per_kwh
    );

    // Step 2: Lock buyer's funds (In real app, buyer would sign this)
    const { txHash: lockTxHash } = await lockFundsServer(vaultPda);


    // Step 3: Start IoT delivery simulation (non-blocking)
    // The delivery runs in the background and completes the trade
    const deliveryPromise = simulateDeliveryConfirmation(
      vaultPda,
      kwh_amount
    ).then((result) => {
      console.log(
        `[TX] Trade completed: ${vaultPda} | ${result.kwhDelivered} kWh | Confirm: ${result.confirmTxHash}`
      );
    });

    // Don't await — let it run in the background
    deliveryPromise.catch((err) =>
      console.error("[TX] Delivery simulation failed:", err)
    );

    // Calculate derived values
    const feeUsdc = total_usdc * PROTOCOL_FEE_RATE;
    const netUsdc = total_usdc - feeUsdc;
    const co2Avoided = kwh_amount * CO2_FACTOR_KG_PER_KWH;

    return NextResponse.json({
      status: "pending",
      vault_pda: vaultPda,
      init_tx_hash: initTxHash,
      lock_tx_hash: lockTxHash,
      explorer_url: getExplorerUrl(initTxHash),
      is_simulated: isSimulated(),
      details: {
        kwh_amount,
        price_per_kwh,
        gross_usdc: total_usdc,
        fee_usdc: feeUsdc,
        net_usdc: netUsdc,
        co2_avoided_kg: parseFloat(co2Avoided.toFixed(3)),
      },
    });
  } catch (error) {
    console.error("[TX] Authorize error:", error);
    return NextResponse.json(
      { error: "Transaction failed", details: String(error) },
      { status: 500 }
    );
  }
}
