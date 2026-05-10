// ═══════════════════════════════════════════════
// Lumos — POST /api/solei/chat
// SSE streaming endpoint for Solei conversations
// Now with session-aware meter history and smart matching
// ═══════════════════════════════════════════════

import { NextRequest } from "next/server";
import { buildSystemPrompt, createSoleiStream, detectUserIntent } from "@/lib/solei-ai";
import { generateMeterReading, generateForecast, DEMO_PROSUMER, PROTOCOL_FEE_RATE } from "@/lib/mock-data";
import { findBestBuyer } from "@/lib/intelligence";
import type { MeterContext, SoleiMessage, TradeProposal, SSEEvent } from "@/lib/types";

// ─── In-Memory Sessions ───

const sessions = new Map<
  string,
  {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    activeProposal: TradeProposal | null;
    meterContext: MeterContext | null;
    meterHistory: number[]; // historical generation readings for forecast calibration
    lastBuyerMatch: { buyer_name: string; neighborhood: string; demand_kwh: number } | null;
  }
>();

// ─── SSE Helpers ───

function encodeSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// ─── Route Handler ───

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, message, demo_hour, lang } = body as {
      session_id: string;
      message: string;
      demo_hour?: number | null;
      lang?: string;
    };

    if (!session_id || !message) {
      return new Response(JSON.stringify({ error: "session_id and message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get or create session
    if (!sessions.has(session_id)) {
      sessions.set(session_id, {
        messages: [],
        activeProposal: null,
        meterContext: null,
        meterHistory: [],
        lastBuyerMatch: null,
      });
    }
    const session = sessions.get(session_id)!;

    // Generate fresh meter reading using real current time or demo override
    // Auto-fallback to 11 AM during nighttime for realistic demo data
    const now = new Date();
    let hour = demo_hour != null ? demo_hour : now.getHours();
    let minute = demo_hour != null ? 30 : now.getMinutes();
    if (demo_hour == null && (hour < 6 || hour > 18)) {
      hour = 11; // Default to peak solar hour for nighttime demos
      minute = 30;
    }
    const reading = generateMeterReading(hour, minute);

    // Track history for forecast calibration
    session.meterHistory.push(reading.generatedKwh);
    if (session.meterHistory.length > 24) {
      session.meterHistory = session.meterHistory.slice(-24);
    }

    // Generate 6-hour forecast
    const forecastArray = generateForecast(hour, minute);

    // Find best buyer using smart matching
    const bestBuyer = await findBestBuyer(DEMO_PROSUMER.id, reading.surplusKwh, hour);
    session.lastBuyerMatch = {
      buyer_name: bestBuyer.buyer_name,
      neighborhood: bestBuyer.neighborhood,
      demand_kwh: bestBuyer.demand_kwh,
    };

    // Build meter context
    const meterContext: MeterContext = {
      current_kwh: reading.generatedKwh,
      surplus_kwh: reading.surplusKwh,
      forecast_kwh: reading.forecastKwh,
      suggested_price: reading.suggestedPriceUsdc,
      buyers_available: reading.buyersAvailable,
    };
    session.meterContext = meterContext;

    // Check user intent for active proposal
    const intent = detectUserIntent(message);

    // Add user message to session
    session.messages.push({ role: "user", content: message });

    // Build system prompt with live meter data + forecast + buyer context
    const systemPrompt = buildSystemPrompt(meterContext, {
      forecast: forecastArray,
      bestBuyer: session.lastBuyerMatch,
      meterHistory: session.meterHistory,
      lang: lang || "es",
    });

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";

          // Filter out any empty messages and limit to last 6 for faster responses
          const cleanMessages = session.messages
            .filter(m => m.content.length > 0)
            .slice(-6);

          // Stream Solei's response
          for await (const chunk of createSoleiStream(cleanMessages, systemPrompt)) {
            if (chunk.type === "text") {
              controller.enqueue(
                new TextEncoder().encode(encodeSSE({ type: "text", content: chunk.content }))
              );
              fullResponse += chunk.content;
            }
          }

          // Save assistant response to session (only if non-empty)
          if (fullResponse.trim().length > 0) {
            session.messages.push({ role: "assistant", content: fullResponse });
          }

          // Detect if this is a buy or sell context from user's original message + AI response
          const userMsgLower = message.toLowerCase();
          const responseLower = fullResponse.toLowerCase();
          const isBuyIntent =
            userMsgLower.includes("comprar") ||
            userMsgLower.includes("buy") ||
            userMsgLower.includes("purchase") ||
            userMsgLower.includes("necesito energ") ||
            userMsgLower.includes("need energy") ||
            (responseLower.includes("compra") && responseLower.includes("autorizo"));

          // BUY PROPOSAL: User wants to purchase energy from a seller
          if (isBuyIntent && !session.activeProposal) {
            const hasBuyProposal =
              responseLower.includes("compra") ||
              responseLower.includes("purchase") ||
              responseLower.includes("$") ||
              responseLower.includes("kwh");

            if (hasBuyProposal) {
              const kwhToBuy = Math.min(2.5, bestBuyer.demand_kwh || 1.5);
              const buyPrice = meterContext.suggested_price;
              const totalUsdc = parseFloat((kwhToBuy * buyPrice).toFixed(4));
              const feeUsdc = parseFloat((totalUsdc * PROTOCOL_FEE_RATE).toFixed(4));
              const netUsdc = parseFloat((totalUsdc - feeUsdc).toFixed(4));

              // In buy mode, the "buyer" fields represent the seller the user is buying FROM
              const proposal: TradeProposal = {
                id: `prop_buy_${Date.now()}`,
                prosumerId: bestBuyer.buyer_id, // seller
                buyerId: DEMO_PROSUMER.id,       // user is the buyer
                buyerName: bestBuyer.buyer_name,  // seller display name
                kwhAmount: kwhToBuy,
                pricePerKwh: buyPrice,
                totalUsdc,
                feeUsdc,
                netUsdc,
                status: "PENDING",
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
              };

              session.activeProposal = proposal;

              controller.enqueue(
                new TextEncoder().encode(
                  encodeSSE({
                    type: "proposal",
                    proposal: {
                      action: "buy",
                      kwh: proposal.kwhAmount,
                      price: proposal.pricePerKwh,
                      buyer: proposal.prosumerId,       // seller id
                      buyer_name: proposal.buyerName,    // seller name
                      total_usdc: proposal.totalUsdc,
                    },
                  })
                )
              );
            }
          }
          // SELL PROPOSAL: If there's surplus, try to detect a sell trade proposal
          else if (meterContext.surplus_kwh > 0 && !session.activeProposal && !isBuyIntent) {
            // Check if Solei's response contains a trade proposal
            const hasProposal =
              fullResponse.includes("vender") ||
              fullResponse.includes("excedente") ||
              fullResponse.includes("$") ||
              fullResponse.includes("kWh");

            if (hasProposal && meterContext.surplus_kwh > 0.5) {
              const kwhToSell = Math.min(meterContext.surplus_kwh, bestBuyer.demand_kwh);
              const totalUsdc = parseFloat((kwhToSell * meterContext.suggested_price).toFixed(4));
              const feeUsdc = parseFloat((totalUsdc * PROTOCOL_FEE_RATE).toFixed(4));
              const netUsdc = parseFloat((totalUsdc - feeUsdc).toFixed(4));

              const proposal: TradeProposal = {
                id: `prop_${Date.now()}`,
                prosumerId: DEMO_PROSUMER.id,
                buyerId: bestBuyer.buyer_id,
                buyerName: bestBuyer.buyer_name,
                kwhAmount: kwhToSell,
                pricePerKwh: meterContext.suggested_price,
                totalUsdc,
                feeUsdc,
                netUsdc,
                status: "PENDING",
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
              };

              session.activeProposal = proposal;

              // Emit proposal event
              controller.enqueue(
                new TextEncoder().encode(
                  encodeSSE({
                    type: "proposal",
                    proposal: {
                      action: "sell",
                      kwh: proposal.kwhAmount,
                      price: proposal.pricePerKwh,
                      buyer: proposal.buyerId,
                      buyer_name: proposal.buyerName,
                      total_usdc: proposal.totalUsdc,
                    },
                  })
                )
              );
            }
          }

          // Handle authorization of active proposal
          if (intent === "AUTHORIZE" && session.activeProposal) {
            session.activeProposal.status = "AUTHORIZED";
            // Transaction will be handled by /api/transaction/authorize
          }

          if (intent === "CANCEL" && session.activeProposal) {
            session.activeProposal.status = "CANCELLED";
            session.activeProposal = null;
          }

          // Send done event
          controller.enqueue(
            new TextEncoder().encode(encodeSSE({ type: "done" }))
          );
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            new TextEncoder().encode(
              encodeSSE({ type: "error", error: "Error procesando tu mensaje" })
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
