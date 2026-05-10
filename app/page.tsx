"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SunIcon, MapIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";
import ProblemSolution from "@/components/landing/problem-solution";
import KeyFeatures from "@/components/landing/key-features";
import MetricsDashboard from "@/components/landing/metrics-dashboard";
import CodeShowcase from "@/components/landing/code-showcase";

import AsciiShader from "@/components/landing/ascii-shader";
import TeamSection from "@/components/landing/team-section";
import Footer from "@/components/landing/footer";
import PwaInstallPrompt from "@/components/ui/pwa-install-prompt";
import ParallaxSection from "@/components/ui/parallax-section";
import SimulationModal from "@/components/solei/simulation-modal";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260330_145725_08886141-ed95-4a8e-8d6d-b75eaadce638.mp4";

export default function LandingPage() {
  const { lang, toggleLang, t } = useTranslation();
  const [showSimulation, setShowSimulation] = useState(false);
  const router = useRouter();

  return (
    <div>
      {/* ═══ Hero Section ═══ */}
      <div className="relative min-h-screen overflow-hidden">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover pixel-render"
          style={{ zIndex: 0 }}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Theme-aware overlay */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            background: "linear-gradient(180deg, rgba(10,14,26,0.4) 0%, rgba(10,14,26,0.15) 40%, rgba(10,14,26,0.85) 100%)",
          }}
        />

        {/* Scanline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          }}
        />

        {/* Floating pixel particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1"
              style={{
                backgroundColor: ["#F97316", "#FBBF24", "#22C55E", "#A78BFA"][i % 4],
                left: `${5 + (i * 7) % 90}%`,
                top: `${10 + (i * 13) % 80}%`,
                opacity: 0.6,
                animation: `hero-float-${(i % 3) + 1} ${8 + (i % 5) * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                boxShadow: `0 0 6px ${["#F97316", "#FBBF24", "#22C55E", "#A78BFA"][i % 4]}`,
              }}
            />
          ))}
        </div>

        {/* Hero → Section bridge */}
        <div className="hero-bridge" />

        {/* Top Bar */}
        <header className="relative flex items-center justify-between px-6 py-4" style={{ zIndex: 10 }}>
          <div className="flex items-center gap-3">
            <div className="pixel-glow">
              <SunIcon size={28} color="#F97316" />
            </div>
            <span className="font-pixel text-sm tracking-tight" style={{ color: "#FFFFFF" }}>
              Lumos
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="w-10 h-10 flex items-center justify-center pixel-btn transition-all font-pixel text-[9px] font-bold"
              style={{ background: "rgba(168, 85, 247, 0.25)", color: "#A78BFA" }}
              aria-label="Toggle language"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
            <Link
              href="/chat"
              className="font-pixel text-xs px-5 py-3 pixel-btn transition-all"
              style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}
            >
              {t("landing.enter")}
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <main className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 10, minHeight: "calc(100vh - 80px)" }}>
          {/* Badge */}
          <div
            className="animate-fade-in-up mb-8 inline-flex items-center gap-2 px-5 py-2 pixel-border font-pixel text-xs"
            style={{
              animationDelay: "200ms",
              backgroundColor: "rgba(249, 115, 22, 0.2)",
              "--pixel-border-color": "rgba(249, 115, 22, 0.5)",
              color: "#FBBF24",
            } as React.CSSProperties}
          >
            <span className="w-2.5 h-2.5 bg-green-400 animate-pulse" />
            {t("landing.badge")}
          </div>

          {/* Title — pixel font via h1 CSS rule */}
          <h1
            className="animate-fade-in-up text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-4xl"
            style={{
              animationDelay: "400ms",
              color: "#FFFFFF",
              textShadow: "0 0 60px rgba(249,115,22,0.3), 0 2px 40px rgba(0,0,0,0.5)",
            }}
          >
            {t("landing.hero_title_1")}{" "}
            <span style={{ background: "linear-gradient(135deg, #F97316, #FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("landing.hero_title_2")}
            </span>{" "}
            {t("landing.hero_title_3")}
          </h1>

          {/* Subtitle — body font for readability */}
          <p
            className="animate-fade-in-up mt-6 text-sm sm:text-base max-w-xl leading-relaxed"
            style={{ animationDelay: "600ms", color: "rgba(255,255,255,0.7)" }}
          >
            {t("landing.hero_sub_1")}
            <br />
            {t("landing.hero_sub_2")}
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 mt-12" style={{ animationDelay: "800ms" }}>
            <Link
              href="/chat"
              className="group px-8 py-4 font-pixel text-xs text-white pixel-btn transition-all"
              style={{
                backgroundColor: "#F97316",
                boxShadow: "0 0 30px rgba(249,115,22,0.5), 0 0 60px rgba(249,115,22,0.2), 0 6px 0 0 #C2410C",
              }}
            >
              <span className="flex items-center gap-2">
                <SunIcon size={16} color="#FFFFFF" />
                {t("landing.cta_sell")}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/map"
              className="px-8 py-4 font-pixel text-xs pixel-btn transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#FFFFFF" }}
            >
              <span className="flex items-center gap-2">
                <MapIcon size={16} color="#FFFFFF" />
                {t("landing.cta_map")}
              </span>
            </Link>
            <button
              onClick={() => setShowSimulation(true)}
              className="px-8 py-4 font-pixel text-xs pixel-btn transition-all animate-pulse cursor-pointer"
              style={{
                backgroundColor: "rgba(251,191,36,0.15)",
                color: "#FBBF24",
                border: "2px solid rgba(251,191,36,0.4)",
              }}
            >
              <span className="flex items-center gap-2">
                ▶ {t("landing.cta_demo")}
              </span>
            </button>
          </div>

          {/* Stats ticker */}
          <div className="animate-fade-in-up mt-20 grid grid-cols-3 gap-8 sm:gap-16" style={{ animationDelay: "1000ms" }}>
            {[
              { value: "Devnet", label: "Network" },
              { value: "$0.09/kWh", label: t("landing.price") },
              { value: "0.001%", label: "Fee" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-pixel text-xs font-bold counter-glow" style={{ color: "#FBBF24" }}>
                  {stat.value}
                </div>
                <div className="font-pixel text-[10px] mt-1 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ animation: "scroll-hint 2s ease-in-out infinite" }}>
            <span className="font-pixel text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Scroll</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </div>
        </main>
      </div>

      {/* ═══ Sections with Dynamic Background ═══ */}
      <div
        className="ambient-glow scanline-animated tech-grid relative"
      >
        {/* Floating ambient orbs — fixed to viewport, drift slowly */}
        <div className="lumos-orb lumos-orb-1" />
        <div className="lumos-orb lumos-orb-2" />
        <div className="lumos-orb lumos-orb-3" />
        <div className="lumos-orb lumos-orb-4" />
        <div className="lumos-orb lumos-orb-5" />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* NEW: Problem / Solution */}
          <ParallaxSection speed={0.02}><ProblemSolution /></ParallaxSection>

          {/* NEW: Key Features */}
          <ParallaxSection speed={0.03}><KeyFeatures /></ParallaxSection>

          {/* Existing sections */}
          <ParallaxSection speed={0.05}><MetricsDashboard /></ParallaxSection>
          <ParallaxSection speed={0.02}><CodeShowcase /></ParallaxSection>
          <ParallaxSection speed={0.04}><AsciiShader /></ParallaxSection>


          {/* NEW: Team Section */}
          <ParallaxSection speed={0.02}><TeamSection /></ParallaxSection>

          {/* PWA Install Prompt — static in landing page */}
          <PwaInstallPrompt />

          <Footer />
        </div>
      </div>
      <SimulationModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        onGoToChat={() => {
          setShowSimulation(false);
          router.push("/chat");
        }}
      />
    </div>
  );
}
