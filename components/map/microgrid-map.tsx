"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/stores";
import { useTranslation } from "@/lib/i18n";
import { pixelSunSVG, pixelHomeSVG } from "@/components/ui/pixel-icons";
import type { MicroGridNode, ActiveTransaction } from "@/lib/types";

// Set token from env
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MicrogridMapProps {
  onNodeClick?: (node: MicroGridNode) => void;
}

/**
 * Interactive Mapbox GL map showing the micro-grid network.
 * Uses Mapbox native Popup for node details (fixes positioning issues).
 * Style: dark-v11, Zoom: 13, Center: Escazú, Costa Rica
 * Spec: 004-UI_UX_DESIGN.md §5.3
 */
export default function MicrogridMap({ onNodeClick }: MicrogridMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const linesRef = useRef<string[]>([]);

  const { nodes, activeTransactions, center, zoom } = useMapStore();
  const { t } = useTranslation();

  // ─── Build popup HTML for a node ───
  const buildPopupHTML = useCallback((node: MicroGridNode): string => {
    const isProsumer = node.nodeType === "prosumer";
    const statusLabel =
      node.status === "available" ? t("map.available")
      : node.status === "trading" ? t("map.trading")
      : t("map.offline");
    const statusColor =
      node.status === "available" ? "#16A34A"
      : node.status === "trading" ? "#D97706"
      : "#6B7280";
    const dotColor =
      node.status === "available" ? "#16A34A"
      : node.status === "trading" ? "#FBBF24"
      : "#6B7280";

    return `
      <div style="font-family:'DM Sans',sans-serif;min-width:190px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${isProsumer ? '#F97316' : '#065F46'};color:white;">
            ${isProsumer ? pixelSunSVG(16, '#FFFFFF') : pixelHomeSVG(16, '#FFFFFF')}
          </span>
          <span style="font-size:14px;font-weight:600;color:#111827;">
            ${node.displayName}
          </span>
        </div>
        <div style="font-size:12px;color:#6B7280;display:flex;flex-direction:column;gap:4px;">
          <span>▸ ${node.neighborhood}</span>
          ${isProsumer && node.currentKwhAvailable !== undefined
            ? `<span>▸ ${t("map.kwh_available")}: <strong style="color:#F97316;">${node.currentKwhAvailable.toFixed(1)} kWh</strong></span>`
            : ''}
          ${isProsumer && node.panelCapacityKw
            ? `<span>▸ ${t("map.capacity")}: ${node.panelCapacityKw} kW</span>`
            : ''}
          ${!isProsumer && node.maxPriceUsdc
            ? `<span>▸ ${t("map.max_price")}: $${node.maxPriceUsdc.toFixed(2)}/kWh</span>`
            : ''}
          <div style="margin-top:4px;">
            <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;background:${statusColor}20;color:${statusColor};">
              <span style="width:6px;height:6px;border-radius:50%;background:${dotColor};"></span>
              ${statusLabel}
            </span>
          </div>
        </div>
      </div>
    `;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: center as [number, number],
      zoom: zoom,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      mapRef.current = map;
      renderMarkers(map, nodes);
      renderTransactionLines(map, activeTransactions, nodes);
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when nodes change
  useEffect(() => {
    if (!mapRef.current) return;
    renderMarkers(mapRef.current, nodes);
  }, [nodes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update lines when transactions change
  useEffect(() => {
    if (!mapRef.current) return;
    renderTransactionLines(mapRef.current, activeTransactions, nodes);
  }, [activeTransactions, nodes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Marker Rendering ───

  const renderMarkers = useCallback(
    (map: mapboxgl.Map, nodeList: MicroGridNode[]) => {
      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();

      nodeList.forEach((node) => {
        const isProsumer = node.nodeType === "prosumer";
        const isTrading = node.status === "trading";
        const hasSurplus = (node.currentKwhAvailable ?? 0) > 0;

        // Outer wrapper — Mapbox controls this element's transform for positioning.
        // NEVER set transform on this element or the marker jumps to (0,0).
        const el = document.createElement("div");
        el.className = "microgrid-marker";
        el.style.cssText = `cursor: pointer;`;

        // Inner visual element — safe to animate/transform
        const inner = document.createElement("div");
        inner.className = "microgrid-marker-inner";
        inner.style.cssText = `
          width: ${isProsumer ? 40 : 36}px;
          height: ${isProsumer ? 40 : 36}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isProsumer ? 20 : 18}px;
          transition: transform 0.2s ease;
          background: ${isProsumer ? "#F97316" : "#065F46"};
          border: 2px solid ${isTrading ? "#FBBF24" : "rgba(255,255,255,0.3)"};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        inner.innerHTML = isProsumer ? pixelSunSVG(20, '#FFFFFF') : pixelHomeSVG(18, '#FFFFFF');

        // Pulse animation for prosumers with surplus
        if (isProsumer && hasSurplus) {
          inner.style.animation = "marker-pulse 2s ease-in-out infinite";
        }

        // Trading ring animation
        if (isTrading) {
          inner.style.animation = "marker-trading 1.5s ease-in-out infinite";
        }

        // Hover effect on INNER element (safe — doesn't touch Mapbox's transform)
        el.addEventListener("mouseenter", () => {
          inner.style.transform = "scale(1.15)";
        });
        el.addEventListener("mouseleave", () => {
          inner.style.transform = "scale(1)";
        });

        el.appendChild(inner);

        // Click handler — use native Mapbox Popup
        el.addEventListener("click", (e) => {
          e.stopPropagation();

          // Remove any existing popup
          popupRef.current?.remove();

          // Create native Mapbox popup at the marker's lngLat
          const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: "240px",
            offset: [0, -20],
            className: "gl-node-popup",
          })
            .setLngLat([node.lng, node.lat])
            .setHTML(buildPopupHTML(node))
            .addTo(map);

          popupRef.current = popup;
          onNodeClick?.(node);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([node.lng, node.lat])
          .addTo(map);

        markersRef.current.set(node.id, marker);
      });
    },
    [onNodeClick, buildPopupHTML]
  );

  // ─── Transaction Line Rendering ───

  const renderTransactionLines = useCallback(
    (
      map: mapboxgl.Map,
      transactions: ActiveTransaction[],
      nodeList: MicroGridNode[]
    ) => {
      // Remove old lines
      linesRef.current.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      });
      linesRef.current = [];

      // Create node lookup
      const nodeMap = new Map(nodeList.map((n) => [n.id, n]));

      transactions.forEach((tx, i) => {
        const fromNode = nodeMap.get(tx.from);
        const toNode = nodeMap.get(tx.to);
        if (!fromNode || !toNode) return;

        const sourceId = `tx-line-${i}`;
        const layerId = `tx-line-layer-${i}`;

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: { status: tx.status },
            geometry: {
              type: "LineString",
              coordinates: [
                [fromNode.lng, fromNode.lat],
                [toNode.lng, toNode.lat],
              ],
            },
          },
        });

        const isConfirmed = tx.status === "confirmed";
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": isConfirmed ? "#16A34A" : "#10B981",
            "line-width": isConfirmed ? 3 : 2,
            "line-dasharray": isConfirmed ? [1, 0] : [2, 2],
            "line-opacity": 0.8,
          },
        });

        linesRef.current.push(sourceId, layerId);
      });
    },
    []
  );

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Custom marker animations + Popup styling */}
      <style>{`
        @keyframes marker-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
        }
        @keyframes marker-trading {
          0%, 100% { border-color: #FBBF24; }
          50% { border-color: rgba(251, 191, 36, 0.3); }
        }
        /* Native Mapbox Popup styling */
        .gl-node-popup .mapboxgl-popup-content {
          background: white;
          border-radius: 12px;
          padding: 12px 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          border: 1px solid #E5E7EB;
        }
        .gl-node-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
        .gl-node-popup .mapboxgl-popup-close-button {
          font-size: 16px;
          padding: 4px 8px;
          color: #9CA3AF;
          right: 4px;
          top: 4px;
        }
        .gl-node-popup .mapboxgl-popup-close-button:hover {
          color: #111827;
          background: transparent;
        }
      `}</style>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-4 px-3 py-2 rounded-lg text-xs"
        style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F97316" }} />
          {t("map.prosumer")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#065F46" }} />
          {t("map.buyer")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 border-t-2 border-dashed" style={{ borderColor: "#10B981", width: 16 }} />
          {t("map.transaction")}
        </span>
      </div>
    </div>
  );
}
