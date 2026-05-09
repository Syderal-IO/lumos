"use client";

import { useTranslation } from "@/lib/i18n";
import { SunIcon, BoltIcon, LeafIcon, MapIcon, ChartIcon } from "@/components/ui/pixel-icons";

/**
 * KeyFeatures — Grid of key features with animated pixel cards.
 */

const FEATURES = [
  {
    titleKey: "landing.feat_1_title",
    descKey: "landing.feat_1_desc",
    icon: <SunIcon size={24} color="#F97316" />,
    color: "#F97316",
  },
  {
    titleKey: "landing.feat_2_title",
    descKey: "landing.feat_2_desc",
    icon: <BoltIcon size={24} color="#FBBF24" />,
    color: "#FBBF24",
  },
  {
    titleKey: "landing.feat_3_title",
    descKey: "landing.feat_3_desc",
    icon: <LeafIcon size={24} color="#22C55E" />,
    color: "#22C55E",
  },
  {
    titleKey: "landing.feat_4_title",
    descKey: "landing.feat_4_desc",
    icon: <MapIcon size={24} color="#A78BFA" />,
    color: "#A78BFA",
  },
  {
    titleKey: "landing.feat_5_title",
    descKey: "landing.feat_5_desc",
    icon: <ChartIcon size={24} color="#38BDF8" />,
    color: "#38BDF8",
  },
  {
    titleKey: "landing.feat_6_title",
    descKey: "landing.feat_6_desc",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#FB923C" strokeWidth="2" />
        <path d="M8 12l3 3 5-5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#FB923C",
  },
];

export default function KeyFeatures() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 font-pixel text-[9px] pixel-border"
          style={{
            backgroundColor: "rgba(249, 115, 22, 0.1)",
            "--pixel-border-color": "rgba(249, 115, 22, 0.3)",
            color: "#FBBF24",
          } as React.CSSProperties}
        >
          <BoltIcon size={10} color="#FBBF24" />
          {t("landing.features_badge")}
        </div>
        <h2
          className="font-pixel text-xl md:text-2xl font-bold"
          style={{ color: "white", textShadow: "0 0 30px rgba(249,115,22,0.2)" }}
        >
          {t("landing.features_title")}
        </h2>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feat, i) => (
          <div
            key={feat.titleKey}
            className="pixel-card fresnel-card p-5 relative overflow-hidden transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: `${feat.color}08`,
              animationDelay: `${i * 100}ms`,
            }}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 w-full h-0.5"
              style={{ background: `linear-gradient(90deg, ${feat.color}, transparent)` }}
            />
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 flex items-center justify-center pixel-border flex-shrink-0"
                style={{
                  backgroundColor: `${feat.color}15`,
                  "--pixel-border-color": feat.color,
                } as React.CSSProperties}
              >
                {feat.icon}
              </div>
              <h3 className="font-pixel text-[11px] font-bold" style={{ color: feat.color }}>
                {t(feat.titleKey as any)}
              </h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t(feat.descKey as any)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
