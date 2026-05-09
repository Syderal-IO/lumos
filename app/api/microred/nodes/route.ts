// ═══════════════════════════════════════════════
// Lumos — GET /api/microred/nodes
// Returns all micro-grid nodes for the map
// Source: 002-ARCHITECTURE.md §6
// ═══════════════════════════════════════════════

import { NextResponse } from "next/server";
import { ALL_NODES, MOCK_BUYERS, isBuyerAvailable } from "@/lib/mock-data";

export async function GET() {
  const hour = new Date().getHours();

  // Apply dynamic buyer availability
  const nodes = ALL_NODES.map((node) => {
    let status = node.status;
    if (node.nodeType === "buyer") {
      const buyer = MOCK_BUYERS.find((b) => b.id === node.id);
      status = buyer && isBuyerAvailable(buyer, hour) ? "available" : "offline";
    }
    return {
      id: node.id,
      type: node.nodeType,
      lat: node.lat,
      lng: node.lng,
      status,
      kwh_available: node.currentKwhAvailable,
      display_name: node.displayName,
      neighborhood: node.neighborhood,
    };
  });

  return NextResponse.json({
    nodes,
    active_transactions: [], // Will be populated when transactions happen
  });
}
