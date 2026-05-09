"use client";

import { useTranslation } from "@/lib/i18n";
import { SunIcon, ChainIcon, TriangleIcon, BrainIcon, MapIcon, AnchorIcon } from "@/components/ui/pixel-icons";

const STACK_NODES = [
  { id: "solana", label: "Solana", Icon: ChainIcon, x: 50, y: 12, desc: "L1 Blockchain" },
  { id: "anchor", label: "Anchor", Icon: AnchorIcon, x: 15, y: 42, desc: "Smart Contracts" },
  { id: "nextjs", label: "Next.js", Icon: TriangleIcon, x: 85, y: 42, desc: "Frontend" },
  { id: "kimi", label: "Kimi AI", Icon: BrainIcon, x: 25, y: 78, desc: "Intelligence" },
  { id: "mapbox", label: "Mapbox", Icon: MapIcon, x: 75, y: 78, desc: "Geospatial" },
  { id: "solei", label: "Solei", Icon: SunIcon, x: 50, y: 48, desc: "Core Engine" },
];

const CONNECTIONS = [
  ["solana", "solei"], ["anchor", "solei"], ["nextjs", "solei"],
  ["kimi", "solei"], ["mapbox", "solei"], ["solana", "anchor"], ["nextjs", "mapbox"],
];

export default function IntegrationMesh() {
  const { t } = useTranslation();
  const nodeMap = Object.fromEntries(STACK_NODES.map((n) => [n.id, n]));

  return (
    <section className="py-28 px-6 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 font-pixel text-[9px] pixel-border"
            style={{
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              "--pixel-border-color": "rgba(56, 189, 248, 0.3)",
              color: "#38BDF8",
            } as React.CSSProperties}
          >
            🔗 {t("landing.stack_badge" as any)}
          </div>
          <h2
            className="font-pixel text-xl md:text-2xl font-bold"
            style={{ color: "white", textShadow: "0 0 30px rgba(56,189,248,0.2)" }}
          >
            {t("landing.stack_title_1" as any)}{" "}
            <span style={{ color: "#38BDF8" }}>{t("landing.stack_title_2" as any)}</span>
          </h2>
        </div>

        {/* Mesh visualization */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            {CONNECTIONS.map(([from, to]) => {
              const a = nodeMap[from]; const b = nodeMap[to];
              return (
                <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  className="mesh-line" stroke="var(--color-solar-orange)" strokeWidth="0.4" opacity="0.35" />
              );
            })}
          </svg>

          {STACK_NODES.map((node) => (
            <div
              key={node.id}
              className="absolute flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className={`pixel-card fresnel-card w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all group-hover:scale-110 ${node.id === "solei" ? "pixel-glow" : ""}`}
                style={
                  node.id === "solei"
                    ? { backgroundColor: "var(--color-solar-orange)", boxShadow: "0 0 30px rgba(249,115,22,0.4)" }
                    : { backgroundColor: "var(--card-bg)" }
                }
              >
                <node.Icon size={28} color={node.id === "solei" ? "#FFFFFF" : "var(--foreground)"} />
              </div>
              <span className="font-pixel text-[10px] font-bold" style={{ color: "var(--foreground)" }}>
                {node.label}
              </span>
              <span
                className="font-pixel text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--foreground-secondary)" }}
              >
                {node.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom tech pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["Rust", "TypeScript", "React", "Prisma", "WebSocket"].map((tech) => (
            <span
              key={tech}
              className="font-pixel text-[9px] px-3 py-1.5 pixel-border transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(56,189,248,0.05)",
                color: "rgba(255,255,255,0.35)",
                "--pixel-border-color": "rgba(56,189,248,0.15)",
              } as React.CSSProperties}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
