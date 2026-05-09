"use client";

import { useTranslation } from "@/lib/i18n";

export default function CodeShowcase() {
  const { t } = useTranslation();

  return (
    <section className="py-28 px-6 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="font-pixel text-[10px] uppercase tracking-[0.3em] mb-4 inline-block" style={{ color: "var(--color-accent-violet)" }}>
            ▸ {t("landing.code_badge" as any)}
          </span>
          <h2 className="font-pixel text-xl md:text-2xl font-bold mb-5" style={{ color: "var(--foreground)" }}>
            {t("landing.code_title_1" as any)}{" "}
            <span style={{ color: "var(--color-accent-violet)" }}>{t("landing.code_title_2" as any)}</span>
          </h2>
          <p className="text-xs leading-relaxed mb-8" style={{ color: "var(--foreground-secondary)" }}>
            {t("landing.code_desc" as any)}
          </p>
          <div className="flex flex-wrap gap-3">
            {["Anchor", "Solana", "USDC", "IoT"].map((tag) => (
              <span
                key={tag}
                className="font-pixel text-[10px] px-4 py-2 pixel-border transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--card-bg)",
                  color: "var(--foreground-secondary)",
                  "--pixel-border-color": "var(--card-border)",
                } as React.CSSProperties}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="pixel-card fresnel-card overflow-hidden scanline-overlay relative" style={{ backgroundColor: "var(--card-bg)" }}>
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ borderBottom: "2px solid var(--card-border)", backgroundColor: "var(--background-secondary)" }}
          >
            <div className="flex gap-2">
              <span className="w-3 h-3" style={{ backgroundColor: "#EF4444" }} />
              <span className="w-3 h-3" style={{ backgroundColor: "#FBBF24" }} />
              <span className="w-3 h-3" style={{ backgroundColor: "#22C55E" }} />
            </div>
            <span className="ml-3 font-pixel text-[10px]" style={{ color: "var(--foreground-secondary)" }}>
              nexus-vault/src/lib.rs
            </span>
          </div>
          <pre className="code-block p-6 text-xs" style={{ color: "var(--foreground)", position: "relative", zIndex: 2 }}>
            <code dangerouslySetInnerHTML={{ __html: `<span class="kw">use</span> anchor_lang::prelude::*;

<span class="cm">/// NexusVault — P2P Energy Escrow</span>
<span class="kw">#[program]</span>
<span class="kw">pub mod</span> <span class="fn">nexus_vault</span> {
  <span class="kw">pub fn</span> <span class="fn">initialize_vault</span>(
    ctx: <span class="ty">Context</span>&lt;InitVault&gt;,
    kwh_amount: <span class="ty">u64</span>,
    price_per_kwh: <span class="ty">u64</span>,
  ) -> <span class="ty">Result</span>&lt;()&gt; {
    <span class="kw">let</span> vault = &amp;<span class="kw">mut</span> ctx.accounts.vault;
    vault.prosumer = ctx.accounts.prosumer.key();
    vault.kwh_amount = kwh_amount;
    vault.price = price_per_kwh;
    vault.status = <span class="ty">VaultStatus</span>::Locked;
    <span class="fn">Ok</span>(())
  }

  <span class="kw">pub fn</span> <span class="fn">confirm_delivery</span>(
    ctx: <span class="ty">Context</span>&lt;Confirm&gt;,
  ) -> <span class="ty">Result</span>&lt;()&gt; {
    <span class="cm">// IoT meter confirms kWh delivered</span>
    <span class="fn">release_funds</span>(&amp;ctx)?;
    <span class="fn">emit!</span>(<span class="ty">TradeCompleted</span> {
      vault: ctx.accounts.vault.key(),
      kwh: ctx.accounts.vault.kwh_amount,
    });
    <span class="fn">Ok</span>(())
  }
}` }} />
          </pre>
        </div>
      </div>
    </section>
  );
}
