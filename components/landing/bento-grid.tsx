"use client";

import { SunIcon, BoltIcon, MapIcon, SatelliteIcon, BrainIcon, DiamondIcon } from "@/components/ui/pixel-icons";

const FEATURES = [
  { title: "Chat con IA", desc: "Solei analiza tu excedente y encuentra al mejor comprador automáticamente.", Icon: SunIcon, className: "bento-wide", color: "var(--color-solar-orange)" },
  { title: "On-Chain", desc: "NexusVault ejecuta escrow atómico en Solana. Sin confianza ciega.", Icon: BoltIcon, className: "", color: "var(--color-accent-violet)" },
  { title: "Mapa en Vivo", desc: "Visualiza prosumidores y transacciones en la micro-red.", Icon: MapIcon, className: "", color: "var(--color-accent-blue)" },
  { title: "IoT Integration", desc: "Lectura directa del medidor inteligente para verificación real.", Icon: SatelliteIcon, className: "bento-wide", color: "var(--color-deep-green)" },
  { title: "Intelligence", desc: "TimesFM 2.5 predice tu generación y optimiza precios.", Icon: BrainIcon, className: "", color: "var(--color-accent-pink)" },
  { title: "Zero Fees", desc: "Solo 0.001% de fee. Sin intermediarios ni bancos.", Icon: DiamondIcon, className: "", color: "var(--color-solar-yellow)" },
];

export default function BentoGrid() {
  return (
    <section className="py-28 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-20">
        <span className="font-pixel text-[10px] uppercase tracking-[0.3em] mb-4 inline-block" style={{ color: "var(--color-solar-orange)" }}>
          ▸ Características
        </span>
        {/* h2 auto-gets pixel font via CSS */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-5" style={{ color: "var(--foreground)" }}>
          Todo lo que necesitas para{" "}
          <span style={{ color: "var(--color-solar-orange)" }}>vender energía</span>
        </h2>
        <p className="text-xs max-w-lg mx-auto" style={{ color: "var(--foreground-secondary)" }}>
          IA, blockchain y IoT en una experiencia unificada.
        </p>
      </div>

      <div className="bento-grid stagger-children">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className={`pixel-card pixel-card-glow p-7 flex flex-col justify-between group ${f.className}`}
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 flex items-center justify-center pixel-border transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: f.color,
                    "--pixel-border-color": f.color,
                    boxShadow: `0 0 20px ${f.color}33`,
                  } as React.CSSProperties}
                >
                  <f.Icon size={24} color="#FFFFFF" />
                </div>
                {/* Title in pixel font */}
                <h3 className="font-pixel text-xs font-bold" style={{ color: "var(--foreground)" }}>
                  {f.title}
                </h3>
              </div>
              {/* Description in body font (DM Sans) — readable */}
              <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
