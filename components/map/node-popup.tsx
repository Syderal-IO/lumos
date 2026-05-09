"use client";

import type { MicroGridNode } from "@/lib/types";

interface NodePopupProps {
  node: MicroGridNode;
  onClose: () => void;
}

/**
 * Popup shown when clicking a node on the map.
 * Shows name, neighborhood, availability, and price.
 * Spec: 004-UI_UX_DESIGN.md §5.3
 */
export default function NodePopup({ node, onClose }: NodePopupProps) {
  const isProsumer = node.nodeType === "prosumer";

  return (
    <div
      className="animate-chat-bubble-in rounded-xl p-3 min-w-[200px] shadow-lg"
      style={{
        backgroundColor: "white",
        border: "1px solid var(--color-border)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{
              backgroundColor: isProsumer ? "var(--color-solar-orange)" : "var(--color-deep-green)",
              color: "white",
            }}
          >
            {isProsumer ? "☀️" : "🏠"}
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--color-dark)" }}>
            {node.displayName}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs opacity-40 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1 text-xs" style={{ color: "var(--color-mid-gray)" }}>
        <div className="flex items-center gap-1">
          <span>📍</span>
          <span>{node.neighborhood}</span>
        </div>

        {isProsumer && node.currentKwhAvailable !== undefined && (
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span>
              Disponible:{" "}
              <span className="font-semibold" style={{ color: "var(--color-solar-orange)" }}>
                {node.currentKwhAvailable.toFixed(1)} kWh
              </span>
            </span>
          </div>
        )}

        {isProsumer && node.panelCapacityKw && (
          <div className="flex items-center gap-1">
            <span>🔆</span>
            <span>Capacidad: {node.panelCapacityKw} kW</span>
          </div>
        )}

        {!isProsumer && node.maxPriceUsdc && (
          <div className="flex items-center gap-1">
            <span>💰</span>
            <span>Precio máx: ${node.maxPriceUsdc.toFixed(2)}/kWh</span>
          </div>
        )}

        {/* Status badge */}
        <div className="pt-1.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{
              backgroundColor:
                node.status === "available"
                  ? "var(--color-light-green)"
                  : node.status === "trading"
                  ? "rgba(251, 191, 36, 0.2)"
                  : "rgba(107, 114, 128, 0.1)",
              color:
                node.status === "available"
                  ? "var(--color-deep-green)"
                  : node.status === "trading"
                  ? "var(--color-warning)"
                  : "var(--color-mid-gray)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  node.status === "available"
                    ? "var(--color-success)"
                    : node.status === "trading"
                    ? "var(--color-warning)"
                    : "var(--color-mid-gray)",
              }}
            />
            {node.status === "available"
              ? "Disponible"
              : node.status === "trading"
              ? "En transacción"
              : "Desconectado"}
          </span>
        </div>
      </div>
    </div>
  );
}
