"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SunIcon, MapIcon, ChartIcon, LeafIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home" as const, Icon: LeafIcon },
  { href: "/chat", labelKey: "nav.chat" as const, Icon: SunIcon },
  { href: "/map", labelKey: "nav.map" as const, Icon: MapIcon },
  { href: "/stats", labelKey: "nav.stats" as const, Icon: ChartIcon },
];

/**
 * Bottom Navigation — Pixel art styled with pixel icons and active indicator.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      className="flex items-center justify-around px-2 py-2 scanline-overlay relative"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(16px)",
        borderTop: "2px solid var(--card-border)",
      }}
    >
      {NAV_ITEMS.map(({ href, labelKey, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-4 py-1.5 transition-all relative"
            style={{ zIndex: 2 }}
          >
            <div className="relative">
              <Icon
                size={20}
                color={isActive ? "var(--color-solar-orange)" : "var(--nav-text)"}
              />
              {isActive && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5"
                  style={{ backgroundColor: "var(--color-solar-orange)" }}
                />
              )}
            </div>
            <span
              className="font-pixel text-[8px]"
              style={{
                color: isActive ? "var(--color-solar-orange)" : "var(--nav-text)",
              }}
            >
              {t(labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
