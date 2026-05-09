"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useMapStore } from "@/stores";
import { ALL_NODES, MOCK_BUYERS, isBuyerAvailable, generateMeterReading } from "@/lib/mock-data";
import type { MicroGridNode } from "@/lib/types";
import MeterHeader from "@/components/ui/meter-header";
import BottomNav from "@/components/ui/bottom-nav";
import TxFeedSidebar from "@/components/map/tx-feed-sidebar";
import EnergyParticles from "@/components/map/energy-particles";

// Dynamic import for Mapbox (no SSR — uses window/document)
const MicrogridMap = dynamic(
  () => import("@/components/map/microgrid-map"),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: "#1a1a2e" }}
    >
      <div className="text-center space-y-2">
        <span className="text-2xl">🗺️</span>
        <p className="font-pixel text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

/**
 * Applies dynamic status to map nodes based on current hour.
 * Buyers: available/offline based on demand curves.
 * Prosumers: show current kWh from meter reading.
 */
function getNodesWithDynamicStatus(): MicroGridNode[] {
  const hour = new Date().getHours();
  const reading = generateMeterReading(hour, new Date().getMinutes());

  return ALL_NODES.map((node) => {
    if (node.nodeType === "buyer") {
      const buyer = MOCK_BUYERS.find((b) => b.id === node.id);
      const available = buyer ? isBuyerAvailable(buyer, hour) : false;
      return { ...node, status: available ? "available" as const : "offline" as const };
    }
    // Demo prosumer shows live surplus
    if (node.id === "prosumer_001") {
      return { ...node, currentKwhAvailable: reading.surplusKwh, status: reading.surplusKwh > 0 ? "available" as const : "full" as const };
    }
    return node;
  });
}

/**
 * Map Page — Micro-grid visualization with live transaction feed.
 * Layout: MeterHeader + (Map + FeedSidebar) + BottomNav
 * Spec: 004-UI_UX_DESIGN.md §5.3
 */
export default function MapPage() {
  const { setNodes } = useMapStore();

  // Load dynamic nodes on mount
  useEffect(() => {
    setNodes(getNodesWithDynamicStatus());
  }, [setNodes]);

  return (
    <div className="flex flex-col h-screen ambient-glow scanline-animated tech-grid">
      <MeterHeader />
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <MicrogridMap />
          <EnergyParticles active={true} />
        </div>
        {/* Feed sidebar — hidden on mobile */}
        <div className="hidden md:block">
          <TxFeedSidebar />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
