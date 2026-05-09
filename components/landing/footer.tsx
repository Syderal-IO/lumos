import Link from "next/link";
import { SunIcon } from "@/components/ui/pixel-icons";

export default function Footer() {
  return (
    <footer className="py-16 px-6" style={{ borderTop: "2px solid var(--card-border)" }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="pixel-glow"><SunIcon size={22} color="var(--color-solar-orange)" /></div>
          <span className="font-pixel text-sm" style={{ color: "var(--foreground)" }}>Lumos</span>
          <span
            className="font-pixel text-[10px] px-2 py-0.5 pixel-border"
            style={{
              color: "var(--foreground-secondary)",
              backgroundColor: "var(--card-bg)",
              "--pixel-border-color": "var(--card-border)",
            } as React.CSSProperties}
          >
            v1.0
          </span>
        </div>

        <div className="flex items-center gap-8">
          {[{ label: "Chat", href: "/chat" }, { label: "Mapa", href: "/map" }, { label: "Stats", href: "/stats" }].map((link) => (
            <Link key={link.href} href={link.href} className="font-pixel text-xs transition-colors hover:opacity-70" style={{ color: "var(--foreground-secondary)" }}>
              {link.label}
            </Link>
          ))}
          <a href="https://explorer.solana.com/?cluster=devnet" target="_blank" rel="noopener noreferrer"
            className="font-pixel text-xs transition-colors hover:opacity-70" style={{ color: "var(--color-solar-orange)" }}>
            Explorer →
          </a>
        </div>

        <div className="text-center sm:text-right">
          <div className="text-sm" style={{ color: "var(--foreground-secondary)" }}>Hecho con ☀ en Costa Rica</div>
          <div className="font-pixel text-[10px] mt-1" style={{ color: "var(--color-solar-orange)" }}>Solana Devnet</div>
        </div>
      </div>
    </footer>
  );
}
