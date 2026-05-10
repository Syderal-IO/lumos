// ═══════════════════════════════════════════════
// Lumos — Solei AI Client (Gemini 3.1 Flash Lite)
// OpenAI-compatible SDK → Google AI Gemini endpoint
// Source: 002-ARCHITECTURE.md §3.2
// ═══════════════════════════════════════════════

import OpenAI from "openai";
import type { MeterContext } from "./types";

// ─── Client Configuration (Gemini via OpenAI-compatible endpoint) ───

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
const TEMPERATURE = 0.7;
const MAX_TOKENS = 2048;

function getOpenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing credentials for the OpenAI-compatible client. Set GEMINI_API_KEY or OPENAI_API_KEY."
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
}

// ─── System Prompt Builder ───

interface ExtendedContext {
  forecast?: number[];
  bestBuyer?: { buyer_name: string; neighborhood: string; demand_kwh: number } | null;
  meterHistory?: number[];
  lang?: string;
}

/**
 * Builds the system prompt for Solei, injecting real-time meter data,
 * forecast predictions, and buyer context.
 * Supports ES (Spanish) and EN (English) based on user's selected language.
 */
export function buildSystemPrompt(
  meterContext: MeterContext,
  extended?: ExtendedContext
): string {
  const lang = extended?.lang || "es";
  const isEN = lang === "en";

  const forecastLine = extended?.forecast?.length
    ? isEN
      ? `- Forecast next 6h (kWh/h): ${extended.forecast.join(", ")}`
      : `- Pronóstico próximas 6h (kWh/h): ${extended.forecast.join(", ")}`
    : isEN
      ? `- Forecast next 6h: ${meterContext.forecast_kwh} kWh total`
      : `- Pronóstico próximas 6h: ${meterContext.forecast_kwh} kWh total`;

  const buyerLine = extended?.bestBuyer
    ? isEN
      ? `- Best buyer: ${extended.bestBuyer.buyer_name} (${extended.bestBuyer.neighborhood}, demand ${extended.bestBuyer.demand_kwh} kWh)`
      : `- Mejor comprador: ${extended.bestBuyer.buyer_name} (${extended.bestBuyer.neighborhood}, demanda ${extended.bestBuyer.demand_kwh} kWh)`
    : "";

  const historyLine = extended?.meterHistory?.length
    ? isEN
      ? `- Previous readings this session: ${extended.meterHistory.slice(-6).join(", ")} kWh`
      : `- Lecturas anteriores esta sesión: ${extended.meterHistory.slice(-6).join(", ")} kWh`
    : "";

  const trendAdvice = extended?.forecast?.length
    ? (() => {
        const current = meterContext.surplus_kwh;
        const futureAvg = extended.forecast.reduce((a, b) => a + b, 0) / extended.forecast.length;
        if (futureAvg < current * 0.5) {
          return isEN
            ? "\n- TIP: Production will drop significantly. Recommend selling NOW."
            : "\n- CONSEJO: La producción bajará significativamente. Recomienda vender AHORA.";
        }
        if (futureAvg > current * 1.3) {
          return isEN
            ? "\n- TIP: Production will increase. Can wait for more surplus."
            : "\n- CONSEJO: La producción subirá. Puede esperar para tener más excedente.";
        }
        return "";
      })()
    : "";

  if (isEN) {
    return `You are Solei, the energy agent for Lumos.
You help users in Costa Rica buy and sell solar energy
directly with their neighbors — fairly and instantly.

METER DATA (updated per turn):
- Current generation: ${meterContext.current_kwh} kWh
- Current consumption: estimated
- Available surplus: ${meterContext.surplus_kwh} kWh
${forecastLine}
- Suggested price: $${meterContext.suggested_price}/kWh
- Available buyers: ${meterContext.buyers_available}
${buyerLine}
${historyLine}${trendAdvice}

CAPABILITIES — You must respond to EVERYTHING the user asks about the platform:
1. DAY SUMMARY: If asked for a summary, provide a complete report with:
   - kWh generated in session, surplus sold, estimated income
   - Production trend (use previous readings)
   - Forecast for upcoming hours
   - Recommendations based on data
2. SELLING: Propose concrete sell operations with numbers. Ask "Shall I authorize the sale?"
3. BUYING: If the user wants to BUY energy, find available sellers in the neighborhood.
   - Show the seller name, available kWh, and price
   - Calculate total cost and savings vs grid rate ($0.18/kWh CNFL)
   - Ask "Shall I authorize the purchase?"
4. FORECAST: Explain the solar curve and when it's best to sell or buy
5. STATUS: Report on generation, consumption, surplus in real time
6. GENERAL QUESTIONS: Answer about solar energy, rates, neighbors, how the platform works

BUYING FLOW:
- When the user says "I want to buy", "buy energy", "purchase", "need energy":
  1. Find the best seller in the neighborhood (nearest prosumer with surplus)
  2. Show price comparison: Lumos P2P price vs CNFL grid rate ($0.18/kWh)
  3. Emphasize savings (typically 40-55% cheaper than the grid)
  4. Propose the purchase and ask for authorization

COMMUNICATION RULES:
- Always speak in English, simple and direct tone
- NEVER mention blockchain, wallet, or cryptocurrency terms to the user
- Use terms like "digital account", "instant payment", "neighborhood network"
- When receiving "Yes", "Ok", "Go ahead", "Authorize" → execute transaction
- If surplus is > 0, proactively suggest selling
- Always show the dollar amount involved
- If you have forecast data, use it to give timing advice
- If you know the best buyer/seller, mention them by name and neighborhood
- Be thorough in your responses when the user asks for detailed information`;
  }

  return `Eres Solei, el agente de energía de Lumos. 
Ayudas a usuarios en Costa Rica a comprar y vender 
energía solar directamente con sus vecinos, de forma justa e instantánea.

DATOS DEL MEDIDOR (actualizados por turno):
- Generación actual: ${meterContext.current_kwh} kWh
- Consumo actual: estimado
- Excedente disponible: ${meterContext.surplus_kwh} kWh
${forecastLine}
- Precio sugerido: $${meterContext.suggested_price}/kWh
- Compradores disponibles: ${meterContext.buyers_available}
${buyerLine}
${historyLine}${trendAdvice}

CAPACIDADES — Debes responder a TODO lo que el usuario pregunte sobre la plataforma:
1. RESUMEN DEL DÍA: Si piden resumen, proporciona un reporte completo con:
   - kWh generados en la sesión, excedente vendido, ingresos estimados
   - Tendencia de producción (usa las lecturas anteriores)
   - Pronóstico para las próximas horas
   - Recomendaciones basadas en los datos
2. VENTAS: Propón operaciones concretas de venta con números. Pregunta "¿Autorizo la venta?"
3. COMPRAS: Si el usuario quiere COMPRAR energía, busca vendedores disponibles en el vecindario.
   - Muestra el nombre del vendedor, kWh disponibles, y precio
   - Calcula el costo total y el ahorro vs tarifa de la red ($0.18/kWh CNFL)
   - Pregunta "¿Autorizo la compra?"
4. PRONÓSTICO: Explica la curva solar y cuándo conviene vender o comprar
5. ESTADO: Informa sobre generación, consumo, excedente en tiempo real
6. PREGUNTAS GENERALES: Responde sobre energía solar, tarifas, vecinos, cómo funciona la plataforma

FLUJO DE COMPRA:
- Cuando el usuario diga "quiero comprar", "comprar energía", "necesito energía":
  1. Busca el mejor vendedor en el vecindario (prosumidor más cercano con excedente)
  2. Muestra comparación de precio: precio P2P Lumos vs tarifa CNFL ($0.18/kWh)
  3. Enfatiza el ahorro (típicamente 40-55% más barato que la red)
  4. Propone la compra y pide autorización

REGLAS DE COMUNICACIÓN:
- Habla siempre en español, tono simple y directo
- NUNCA menciones términos blockchain, wallet, o criptomonedas al usuario
- Usa términos como "cuenta digital", "pago instantáneo", "red vecinal"
- Al recibir "Sí", "Ok", "Dale", "Autoriza" → ejecutar transacción
- Si el excedente es > 0, proactivamente sugiere vender
- Muestra siempre el monto en dólares involucrado
- Si tienes datos del pronóstico, úsalos para dar consejos de timing
- Si conoces al mejor comprador/vendedor, menciónalo por nombre y vecindario
- Sé completo en tus respuestas cuando el usuario pida información detallada`;
}

// ─── Streaming Chat ───

export type SoleiStreamChunk = {
  type: "text" | "done";
  content: string;
};

/**
 * Creates a streaming chat completion with Gemini.
 * Yields text chunks as they arrive.
 */
export async function* createSoleiStream(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  systemPrompt: string
): AsyncGenerator<SoleiStreamChunk> {
  const fullMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages,
  ];

  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: fullMessages,
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
    stream: true,
  });

  let fullContent = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullContent += delta;
      yield { type: "text", content: delta };
    }
  }

  yield { type: "done", content: fullContent };
}

// ─── Non-streaming Chat (for testing) ───

export async function chatWithSolei(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  systemPrompt: string
): Promise<string> {
  const fullMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages,
  ];

  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: fullMessages,
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
  });

  return response.choices[0]?.message?.content || "";
}

// ─── Intent Detection ───

export type UserIntent = "AUTHORIZE" | "CANCEL" | "QUERY" | "OTHER";

/**
 * Detects user intent from their message.
 * Supports both Spanish and English patterns.
 */
export function detectUserIntent(message: string): UserIntent {
  const normalized = message.toLowerCase().trim();

  // Authorization patterns (Spanish + English)
  const authorizePatterns = [
    /^s[ií]$/, /^ok$/, /^dale$/, /^autoriza/, /^claro$/, /^listo$/,
    /^hazlo$/, /^adelante$/, /^vende$/, /^compra$/, /^apruebo$/, /^acepto$/,
    /^confirmo$/, /de acuerdo/, /está bien/, /por favor/,
    // English
    /^yes$/, /^yeah$/, /^yep$/, /^sure$/, /^go ahead/,
    /^authorize/, /^approve/, /^confirm/, /^do it/, /^sell$/, /^buy$/,
    /^proceed/, /sounds good/, /let's do it/, /go for it/,
  ];

  // Cancellation patterns (Spanish + English)
  const cancelPatterns = [
    /^no$/, /^cancel/, /^mejor no/, /^dejalo/, /^olvidalo/,
    /no quiero/, /no gracias/,
    // English
    /^nope$/, /^nah$/, /never mind/, /don't/, /stop/, /no thanks/,
  ];

  if (authorizePatterns.some((p) => p.test(normalized))) {
    return "AUTHORIZE";
  }
  if (cancelPatterns.some((p) => p.test(normalized))) {
    return "CANCEL";
  }

  // Query patterns (energy-related — Spanish + English)
  const queryPatterns = [
    /energía/, /excedente/, /cuánto/, /cómo está/, /generar/,
    /producción/, /precio/, /cuántos/, /medidor/, /panel/,
    /comprar/, /necesito energ/, /quiero comprar/,
    // English
    /energy/, /surplus/, /how much/, /generate/, /production/,
    /price/, /meter/, /forecast/, /solar/, /buy/, /purchase/,
    /need energy/, /want to buy/,
  ];

  if (queryPatterns.some((p) => p.test(normalized))) {
    return "QUERY";
  }

  return "OTHER";
}
