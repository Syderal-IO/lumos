"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSoleiStore, useMeterStore, useTransactionStore } from "@/stores";
import { generateMeterReading, DEMO_PROSUMER, CO2_FACTOR_KG_PER_KWH, getDemoSafeTime } from "@/lib/mock-data";
import type { SoleiMessage, SSEEvent } from "@/lib/types";
import { useSolPrice } from "@/hooks/use-sol-price";
import { smartForecastFromHour } from "@/lib/forecast-utils";
import ChatBubble from "./chat-bubble";
import ProposalCard from "./proposal-card";
import ActionButtons from "./action-buttons";
import InputBar from "./input-bar";
import TxProgress from "@/components/ui/tx-progress";
import TxConfirmed from "@/components/ui/tx-confirmed";
import WeeklyInsight from "@/components/solei/weekly-insight";
import ForecastCard from "@/components/solei/forecast-card";

import { useToast } from "@/components/ui/toast-provider";
import { useTranslation } from "@/lib/i18n";

// ─── Transaction result type ───
interface TxResult {
  netUsdc: number;
  kwhDelivered: number;
  co2AvoidedKg: number;
  explorerUrl: string;
  buyerName: string;
  isSimulated: boolean;
}

/**
 * Main chat container — orchestrates the full Solei conversation flow.
 * Auto-scrolls, handles SSE streaming, manages proposals, and shows tx progress.
 */
export default function ChatContainer() {
  const {
    messages,
    isStreaming,
    activeProposal,
    sessionId,
    addMessage,
    updateLastAssistant,
    setStreaming,
    setActiveProposal,
  } = useSoleiStore();

  const { currentReading, setCurrentReading } = useMeterStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAuthorizing = useRef(false);
  const welcomeSent = useRef(false);

  // Transaction progress state
  const [txProcessing, setTxProcessing] = useState(false);
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [proposalAction, setProposalAction] = useState<"sell" | "buy">("sell");
  const { t, lang } = useTranslation();

  // Real-time SOL/USD price from Pyth Network
  const { price: solPrice, source: priceSource, loading: priceLoading } = useSolPrice();

  // Helper: build the welcome text from current translations + meter reading
  const buildWelcomeText = useCallback(() => {
    const { hour, minute } = getDemoSafeTime(useMeterStore.getState().demoHour);
    const reading = currentReading || generateMeterReading(hour, minute);
    return `${t("chat.welcome")} ${t("chat.generating")} ${reading.generatedKwh.toFixed(1)} kWh${reading.surplusKwh > 0 ? ` ${reading.surplusKwh.toFixed(1)} ${t("chat.surplus_available")}` : ""}. ${t("chat.help")}`;
  }, [t, currentReading]);

  // Initialize meter reading on mount — uses real current time or demo override
  useEffect(() => {
    if (!currentReading) {
      const { hour, minute } = getDemoSafeTime(useMeterStore.getState().demoHour);
      setCurrentReading(generateMeterReading(hour, minute));
    }
  }, [currentReading, setCurrentReading]);

  // Auto-scroll to bottom on new messages / state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeProposal, txProcessing, txResult]);

  // Unified welcome message effect — handles initial creation, remount sync, and language changes
  useEffect(() => {
    const store = useSoleiStore.getState();
    const existingWelcome = store.messages.find(
      (m) => m.role === "assistant" && m.id.startsWith("welcome_")
    );

    if (!welcomeSent.current && store.messages.length === 0) {
      // First ever mount — create the welcome message
      welcomeSent.current = true;
      const welcomeMsg: SoleiMessage = {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content: buildWelcomeText(),
        timestamp: new Date().toISOString(),
      };
      addMessage(welcomeMsg);
      return;
    }

    // Remount or language change — sync the existing welcome message
    welcomeSent.current = true;
    if (!existingWelcome) return;
    const newText = buildWelcomeText();
    if (existingWelcome.content === newText) return;
    const updated = store.messages.map((m) =>
      m.id === existingWelcome.id ? { ...m, content: newText } : m
    );
    useSoleiStore.setState({ messages: updated });
  }, [lang, buildWelcomeText]); // eslint-disable-line react-hooks/exhaustive-deps

  // #9 Auto-trigger demo from ?demo=true (landing page CTA)
  const searchParams = useSearchParams();
  const demoTriggered = useRef(false);
  useEffect(() => {
    if (searchParams.get("demo") !== "true") return;
    if (demoTriggered.current) return;
    if (messages.length === 0 || isStreaming) return;

    demoTriggered.current = true;
    const timer = setTimeout(() => {
      handleSimulation();
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send message to Solei
  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      // Add user message
      const userMsg: SoleiMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);

      // Create placeholder for assistant response
      const assistantMsg: SoleiMessage = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMsg);
      setStreaming(true);

      let fullText = "";
      try {
        const response = await fetch("/api/solei/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            message: text,
            demo_hour: useMeterStore.getState().demoHour,
            lang: (typeof window !== "undefined" && localStorage.getItem("lumos_lang")) || "es",
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to connect to Solei");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: SSEEvent = JSON.parse(line.slice(6));

              if (event.type === "text" && event.content) {
                fullText += event.content;
                updateLastAssistant(fullText);
              }

              if (event.type === "proposal" && event.proposal) {
                setProposalAction(event.proposal.action || "sell");
                setActiveProposal({
                  id: `prop_${Date.now()}`,
                  prosumerId: DEMO_PROSUMER.id,
                  buyerId: event.proposal.buyer,
                  buyerName: event.proposal.buyer_name,
                  kwhAmount: event.proposal.kwh,
                  pricePerKwh: event.proposal.price,
                  totalUsdc: event.proposal.total_usdc,
                  feeUsdc: parseFloat((event.proposal.total_usdc * 0.001).toFixed(4)),
                  netUsdc: parseFloat((event.proposal.total_usdc * 0.999).toFixed(4)),
                  status: "PENDING",
                  createdAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 600000).toISOString(),
                });
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        updateLastAssistant(t("chat.error_connection"));
      } finally {
        setStreaming(false);
        // Detect forecast-related responses → show forecast card
        // Use fullText from the streaming closure for reliable detection
        if (fullText) {
          const txt = fullText.toLowerCase();
          const forecastKeywords = ["pronóstico", "producción", "próximas horas", "curva solar", "forecast", "generación esperada", "predicción", "producir"];
          if (forecastKeywords.some(k => txt.includes(k))) {
            setShowForecast(true);
          } else {
            setShowForecast(false);
          }
        }
      }
    },
    [sessionId, isStreaming, addMessage, updateLastAssistant, setStreaming, setActiveProposal]
  );

  // Handle authorize — calls /api/transaction/authorize with progress UI
  const handleAuthorize = useCallback(async () => {
    if (!activeProposal || isAuthorizing.current) return;
    isAuthorizing.current = true;

    const proposal = { ...activeProposal };
    setActiveProposal(null);
    setTxProcessing(true);
    setTxResult(null);

    try {
      const response = await fetch("/api/transaction/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          proposal: {
            prosumer_id: proposal.prosumerId,
            buyer_id: proposal.buyerId,
            kwh_amount: proposal.kwhAmount,
            price_per_kwh: proposal.pricePerKwh,
            total_usdc: proposal.totalUsdc,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Show confirmed card after progress completes
        setTxResult({
          netUsdc: result.details.net_usdc,
          kwhDelivered: proposal.kwhAmount,
          co2AvoidedKg: result.details.co2_avoided_kg,
          explorerUrl: result.explorer_url,
          buyerName: proposal.buyerName,
          isSimulated: result.is_simulated,
        });

        // Record in transaction store for Trade History
        useTransactionStore.getState().addTransaction({
          id: `tx_${Date.now()}`,
          proposalId: proposal.id,
          prosumerId: proposal.prosumerId,
          buyerId: proposal.buyerName,
          kwhDelivered: proposal.kwhAmount,
          pricePerKwhUsdc: proposal.pricePerKwh,
          grossUsdc: proposal.totalUsdc,
          feeUsdc: result.details.fee_usdc,
          netUsdc: result.details.net_usdc,
          vaultPda: result.vault_pda,
          txHash: result.init_tx_hash,
          status: "CONFIRMED",
          co2AvoidedKg: result.details.co2_avoided_kg,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
      } else {
        setTxProcessing(false);
        const errorMsg: SoleiMessage = {
          id: `tx_error_${Date.now()}`,
          role: "assistant",
          content: `❌ ${t("chat.error_sale")} ${result.error || ""}`,
          timestamp: new Date().toISOString(),
        };
        addMessage(errorMsg);
      }
    } catch {
      setTxProcessing(false);
      const errorMsg: SoleiMessage = {
        id: `tx_error_${Date.now()}`,
        role: "assistant",
        content: `❌ ${t("chat.error_network")}`,
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMsg);
    } finally {
      isAuthorizing.current = false;
    }
  }, [activeProposal, sessionId, addMessage, setActiveProposal]);

  // Called when progress animation finishes
  const handleProgressComplete = useCallback(() => {
    setTxProcessing(false);
  }, []);

  // Dismiss the confirmed card
  const handleDismissConfirmed = useCallback(() => {
    setTxResult(null);
    const followUp: SoleiMessage = {
      id: `followup_${Date.now()}`,
      role: "assistant",
      content: t("chat.followup"),
      timestamp: new Date().toISOString(),
    };
    addMessage(followUp);
  }, [addMessage]);

  // Handle reject
  const handleReject = useCallback(() => {
    setActiveProposal(null);
    handleSend("No, mejor no por ahora");
  }, [handleSend, setActiveProposal]);

  const isInputDisabled = isStreaming || txProcessing;
  const { addToast } = useToast();
  const [showInsight, setShowInsight] = useState(true);

  // #9 Simulation mode — auto-run the full demo flow
  const handleSimulation = useCallback(async () => {
    addToast(t("chat.sim_start"), "info");
    setShowInsight(false);
    await handleSend(t("chat.sim_sell"));
  }, [handleSend, addToast]);

  const meshColors = { bg: "#0A0E1A", c1: "#1A1228", c2: "#14110A", c3: "#0C1220" };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Scrollable message area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{
          backgroundColor: meshColors.bg,
          backgroundImage: `linear-gradient(-45deg, ${meshColors.bg} 0%, ${meshColors.c1} 17%, ${meshColors.bg} 33%, ${meshColors.c2} 50%, ${meshColors.bg} 67%, ${meshColors.c3} 83%, ${meshColors.bg} 100%)`,
          backgroundSize: "600% 600%",
          animation: "gradient-mesh 12s ease infinite",
        }}
      >
        {/* SOL/USD Price Badge — Powered by Pyth */}
        {solPrice !== null && (
          <div
            className="flex items-center justify-center gap-2 py-1.5 mb-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="font-pixel text-[8px]" style={{ color: "var(--foreground-secondary)" }}>
              ◎ SOL
            </span>
            <span className={`font-pixel text-[9px] font-bold ${priceLoading ? 'price-updating' : ''}`} style={{ color: "var(--color-solar-yellow)" }}>
              ${solPrice.toFixed(2)}
            </span>
            <span
              className="w-1.5 h-1.5 inline-block rounded-full"
              style={{ backgroundColor: priceSource === 'pyth' ? 'var(--color-success)' : 'var(--color-solar-yellow)' }}
              title={`Powered by ${priceSource === 'pyth' ? 'Pyth Network' : priceSource === 'coingecko' ? 'CoinGecko' : 'Cached'}`}
            />
            <span className="font-pixel text-[6px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              {priceSource === 'pyth' ? 'PYTH' : priceSource === 'coingecko' ? 'CG' : '~'}
            </span>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}

        {/* #16 Weekly Insight — show until user sends first message */}
        {showInsight && !messages.some(m => m.role === "user") && !activeProposal && !txProcessing && (
          <div className="ml-10">
            <WeeklyInsight />
          </div>
        )}

        {/* AI Forecast Card — shows when Solei discusses forecasts */}
        {showForecast && !activeProposal && !txProcessing && (
          <div className="ml-10">
            <ForecastCard
              mean={smartForecastFromHour(new Date().getHours()).mean}
              p10={smartForecastFromHour(new Date().getHours()).p10}
              p90={smartForecastFromHour(new Date().getHours()).p90}
              startHour={new Date().getHours()}
            />
          </div>
        )}

        {/* Proposal card + action buttons */}
        {activeProposal && !txProcessing && (
          <div className="space-y-3 ml-10">
            <ProposalCard
              kwh={activeProposal.kwhAmount}
              pricePerKwh={activeProposal.pricePerKwh}
              buyerName={activeProposal.buyerName}
              totalUsdc={activeProposal.totalUsdc}
              action={proposalAction}
            />
            <ActionButtons
              onAuthorize={handleAuthorize}
              onReject={handleReject}
              isLoading={isStreaming}
            />
          </div>
        )}

        {/* Transaction progress */}
        {txProcessing && (
          <div className="ml-10">
            <TxProgress
              isActive={txProcessing}
              onComplete={handleProgressComplete}
            />
          </div>
        )}

        {/* Transaction confirmed card */}
        {txResult && !txProcessing && (
          <div className="ml-10 space-y-3">
            <TxConfirmed
              netUsdc={txResult.netUsdc}
              kwhDelivered={txResult.kwhDelivered}
              co2AvoidedKg={txResult.co2AvoidedKg}
              explorerUrl={txResult.explorerUrl}
              buyerName={txResult.buyerName}
              isSimulated={txResult.isSimulated}
            />
            <button
              onClick={handleDismissConfirmed}
              className="text-xs font-medium py-1.5 px-3 rounded-lg transition-colors hover:opacity-80"
              style={{ color: "var(--color-mid-gray)" }}
            >
              {t("chat.continue")}
            </button>
          </div>
        )}
      </div>

      {/* Input bar */}
      <InputBar onSend={handleSend} disabled={isInputDisabled} />
    </div>
  );
}
