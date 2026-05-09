// ═══════════════════════════════════════════════
// Lumos — Intelligence Service (Smart Mocks)
// Realistic buyer matching + solar forecast
// ═══════════════════════════════════════════════

import type { ForecastResult, MatchResult } from "./types";
import {
  MOCK_BUYERS,
  MOCK_PROSUMER_PROFILES,
  getBuyerDemand,
  isBuyerAvailable,
  solarIrradiance,
  type BuyerProfile,
} from "./mock-data";

const BASE_URL = process.env.INTELLIGENCE_URL || "http://localhost:8000";

// ─── Health Check ───

export async function checkIntelligenceHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Solar Forecast ───

/**
 * Request a solar generation forecast.
 * Falls back to smart inline simulation if the Python service is unavailable.
 */
export async function forecastSolar(
  history: number[],
  horizon: number = 6,
  overrideHour?: number
): Promise<ForecastResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, horizon }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`Forecast service error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn("Intelligence service unavailable, using smart mock:", error);
    return smartForecast(history, horizon, overrideHour);
  }
}

// ─── Buyer Matching ───

/**
 * Find the best buyer for a prosumer's surplus energy.
 * Uses smart scoring algorithm when the Python service is unavailable.
 */
export async function findBestBuyer(
  prosumerId: string,
  surplusKwh: number,
  overrideHour?: number
): Promise<MatchResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prosumer_id: prosumerId,
        surplus_kwh: surplusKwh,
      }),
      signal: AbortSignal.timeout(1500),
    });

    if (!res.ok) {
      throw new Error(`Match service error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn("Intelligence service unavailable, using smart match:", error);
    return smartMatch(prosumerId, surplusKwh, overrideHour);
  }
}

// ─── Smart Forecast (Solar Bell Curve Model) ───

function smartForecast(history: number[], horizon: number, overrideHour?: number): ForecastResult {
  const now = new Date();
  const currentHour = overrideHour ?? now.getHours();
  const currentMinute = overrideHour != null ? 30 : now.getMinutes();

  const mean: number[] = [];
  const p10: number[] = [];
  const p90: number[] = [];

  for (let i = 1; i <= horizon; i++) {
    const futureHour = currentHour + i;
    const irr = solarIrradiance(futureHour, currentMinute);

    // If we have history, use it to calibrate
    const historyAvg = history.length > 0
      ? history.reduce((a, b) => a + b, 0) / history.length
      : 2.0;
    const calibration = history.length > 3 ? historyAvg / 2.5 : 1.0;

    const predicted = Math.max(0, 5.0 * irr * Math.min(1.5, Math.max(0.5, calibration)));

    // Uncertainty grows with horizon
    const uncertaintySpread = 0.08 * i;

    mean.push(parseFloat(predicted.toFixed(3)));
    p10.push(parseFloat(Math.max(0, predicted * (1 - uncertaintySpread)).toFixed(3)));
    p90.push(parseFloat((predicted * (1 + uncertaintySpread)).toFixed(3)));
  }

  return {
    mean_predictions: mean,
    quantiles_p10: p10,
    quantiles_p90: p90,
    horizon_hours: horizon,
  };
}

// ─── Smart Buyer Matching (Scoring Algorithm) ───

/**
 * Scores and ranks all available buyers for a given prosumer and surplus.
 * Score = (demandMatch × 0.4) + (proximity × 0.3) + (priceMatch × 0.2) + (reliability × 0.1)
 */
function smartMatch(prosumerId: string, surplusKwh: number, overrideHour?: number): MatchResult {
  const hour = overrideHour ?? new Date().getHours();
  const prosumer = MOCK_PROSUMER_PROFILES.find((p) => p.id === prosumerId)
    || MOCK_PROSUMER_PROFILES[0];

  // Score each available buyer
  const scored = MOCK_BUYERS
    .filter((b) => isBuyerAvailable(b, hour))
    .map((buyer) => {
      const demand = getBuyerDemand(buyer, hour);
      const distance = haversineDistance(
        prosumer.lat, prosumer.lng,
        buyer.lat, buyer.lng
      );

      // 1. Demand match (0–1): how well does their demand match our surplus?
      const demandRatio = Math.min(demand, surplusKwh) / Math.max(demand, surplusKwh, 0.1);
      const demandScore = demandRatio;

      // 2. Proximity (0–1): closer = better, max useful distance 5km
      const proximityScore = Math.max(0, 1 - distance / 5000);

      // 3. Price match (0–1): higher max price = better for seller
      const priceScore = Math.min(1, (buyer.maxPriceUsdc || 0.09) / 0.14);

      // 4. Reliability (0–1): directly from profile
      const reliabilityScore = buyer.reliabilityScore;

      const totalScore =
        demandScore * 0.4 +
        proximityScore * 0.3 +
        priceScore * 0.2 +
        reliabilityScore * 0.1;

      return {
        buyer,
        demand,
        distance,
        score: totalScore,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Pick the best match (or fallback)
  const best = scored[0];

  if (!best) {
    // No buyers available (night time)
    return {
      buyer_id: "buyer_001",
      buyer_name: "Vecino A",
      distance_m: 150,
      demand_kwh: 0,
      max_price: 0.09,
      confidence: 0.3,
      neighborhood: "Escazú",
    };
  }

  return {
    buyer_id: best.buyer.id,
    buyer_name: best.buyer.displayName,
    distance_m: Math.round(best.distance),
    demand_kwh: Math.min(best.demand, surplusKwh),
    max_price: best.buyer.maxPriceUsdc || 0.09,
    confidence: parseFloat(Math.min(0.98, best.score).toFixed(2)),
    neighborhood: best.buyer.neighborhood,
  };
}

// ─── Haversine Distance (meters) ───

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
