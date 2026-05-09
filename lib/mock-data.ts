// ═══════════════════════════════════════════════
// Lumos — Smart Mock Data (Dynamic Demo)
// Realistic solar simulation with weather, demand curves, and dynamic pricing
// ═══════════════════════════════════════════════

import type { MicroGridNode, MeterReading } from "./types";

// ─── Session-level Weather Simulation ───
// Generates once per import (i.e. per server start / page load)
// Persists for the duration of the session

/** Cloud factor 0.6–1.0 (1.0 = clear sky, 0.6 = heavy overcast) */
const SESSION_CLOUD_FACTOR = 0.7 + Math.random() * 0.3;

/** Daily temperature factor affecting panel efficiency (0.92–1.0) */
const SESSION_TEMP_FACTOR = 0.92 + Math.random() * 0.08;

/** Base panel capacity for the demo prosumer (kW) */
const PANEL_CAPACITY_KW = 5.0;

// ─── Solar Curve Model ───

/**
 * Calculates solar irradiance factor for a given hour (0–23).
 * Bell curve: zero before 6am and after 6pm, peak at noon.
 * Applies weather and temperature factors.
 */
export function solarIrradiance(hour: number, minute: number = 0): number {
  const t = hour + minute / 60;
  if (t < 5.5 || t > 18.5) return 0; // night

  // Smooth bell curve centered at 12:00, spread across 5.5–18.5
  const normalized = (t - 5.5) / 13; // 0 to 1 across daylight hours
  const curve = Math.sin(normalized * Math.PI); // 0→1→0

  // Add slight morning ramp (panels need warmup)
  const warmup = t < 7 ? 0.3 + 0.7 * ((t - 5.5) / 1.5) : 1.0;

  return curve * warmup * SESSION_CLOUD_FACTOR * SESSION_TEMP_FACTOR;
}

/**
 * Generates a 6-hour forecast array from current hour.
 * Uses the same solar model so predictions feel consistent.
 */
export function generateForecast(currentHour: number, currentMinute: number = 0): number[] {
  const forecast: number[] = [];
  for (let i = 1; i <= 6; i++) {
    const futureHour = currentHour + i;
    const futureMins = currentMinute;
    const irr = solarIrradiance(futureHour, futureMins);
    // Add slight uncertainty that grows with horizon
    const uncertainty = 1 + (Math.random() - 0.5) * 0.1 * i;
    const gen = Math.max(0, PANEL_CAPACITY_KW * irr * uncertainty);
    // Subtract expected consumption
    const consumption = getConsumptionForHour(futureHour);
    const surplus = Math.max(0, gen - consumption);
    forecast.push(parseFloat(surplus.toFixed(2)));
  }
  return forecast;
}

// ─── Consumption Patterns ───

/**
 * Realistic household consumption by hour of day (kW).
 * Morning peak (7–9am): breakfast, getting ready
 * Afternoon dip (10am–3pm): nobody home
 * Evening peak (5–9pm): cooking, AC, entertainment
 * Night baseline: fridge, standby
 */
function getConsumptionForHour(hour: number): number {
  const patterns: Record<number, number> = {
    0: 0.4, 1: 0.35, 2: 0.3, 3: 0.3, 4: 0.3, 5: 0.35,
    6: 0.6, 7: 1.1, 8: 1.3, 9: 1.0,
    10: 0.7, 11: 0.6, 12: 0.8, 13: 0.7, 14: 0.6, 15: 0.65,
    16: 0.8, 17: 1.2, 18: 1.5, 19: 1.4, 20: 1.2, 21: 0.9,
    22: 0.6, 23: 0.45,
  };
  const base = patterns[Math.floor(hour) % 24] || 0.5;
  // ±12% daily variation
  return base * (0.88 + Math.random() * 0.24);
}

// ─── Dynamic Pricing ───

/**
 * Calculates suggested price based on supply/demand balance.
 * More surplus + fewer buyers → lower price (incentivize sales)
 * Less surplus + more buyers → higher price (market premium)
 */
function calculatePrice(surplusKwh: number, buyersAvailable: number): number {
  const BASE_PRICE = 0.09;

  // Supply pressure: more surplus → lower price
  const supplyFactor = surplusKwh > 3 ? 0.85 : surplusKwh > 1.5 ? 0.95 : 1.1;

  // Demand factor: more buyers → higher price
  const demandFactor = buyersAvailable >= 4 ? 1.15 : buyersAvailable >= 2 ? 1.05 : 0.9;

  // Time-of-day premium: peak hours are worth more
  const hour = new Date().getHours();
  const peakFactor = (hour >= 17 && hour <= 20) ? 1.12 : 1.0;

  const price = BASE_PRICE * supplyFactor * demandFactor * peakFactor;
  return parseFloat(Math.min(0.14, Math.max(0.06, price)).toFixed(3));
}

// ─── Buyer Pool (Expanded) ───

export interface BuyerProfile extends MicroGridNode {
  demandPeakHour: number;    // hour when demand is highest
  demandBaseKwh: number;     // base demand in kWh
  reliabilityScore: number;  // 0–1, how reliably they complete trades
  availableFrom: number;     // hour
  availableTo: number;       // hour
}

export const MOCK_BUYERS: BuyerProfile[] = [
  {
    id: "buyer_001", displayName: "Vecino A", nodeType: "buyer",
    lat: 9.9335, lng: -84.0865, neighborhood: "Escazú", status: "available",
    maxPriceUsdc: 0.10, demandPeakHour: 18, demandBaseKwh: 3.5,
    reliabilityScore: 0.95, availableFrom: 7, availableTo: 22,
  },
  {
    id: "buyer_002", displayName: "Vecino B", nodeType: "buyer",
    lat: 9.9358, lng: -84.0795, neighborhood: "Sabana", status: "available",
    maxPriceUsdc: 0.11, demandPeakHour: 12, demandBaseKwh: 5.0,
    reliabilityScore: 0.88, availableFrom: 8, availableTo: 18,
  },
  {
    id: "buyer_003", displayName: "Vecino C", nodeType: "buyer",
    lat: 9.9520, lng: -84.0440, neighborhood: "Moravia", status: "available",
    maxPriceUsdc: 0.09, demandPeakHour: 19, demandBaseKwh: 2.8,
    reliabilityScore: 0.92, availableFrom: 6, availableTo: 23,
  },
  {
    id: "buyer_004", displayName: "Vecino D", nodeType: "buyer",
    lat: 9.9195, lng: -84.0390, neighborhood: "Curridabat", status: "available",
    maxPriceUsdc: 0.10, demandPeakHour: 17, demandBaseKwh: 4.0,
    reliabilityScore: 0.90, availableFrom: 7, availableTo: 21,
  },
  {
    id: "buyer_005", displayName: "Vecino E", nodeType: "buyer",
    lat: 9.9410, lng: -84.1050, neighborhood: "Rohrmoser", status: "available",
    maxPriceUsdc: 0.12, demandPeakHour: 13, demandBaseKwh: 6.0,
    reliabilityScore: 0.85, availableFrom: 9, availableTo: 17,
  },
  {
    id: "buyer_006", displayName: "Vecino F", nodeType: "buyer",
    lat: 9.9310, lng: -84.0510, neighborhood: "San Pedro", status: "available",
    maxPriceUsdc: 0.10, demandPeakHour: 20, demandBaseKwh: 3.2,
    reliabilityScore: 0.93, availableFrom: 6, availableTo: 22,
  },
  {
    id: "buyer_007", displayName: "Vecino G", nodeType: "buyer",
    lat: 9.9980, lng: -84.1170, neighborhood: "Heredia", status: "available",
    maxPriceUsdc: 0.08, demandPeakHour: 11, demandBaseKwh: 7.0,
    reliabilityScore: 0.80, availableFrom: 8, availableTo: 20,
  },
  {
    id: "buyer_008", displayName: "Vecino H", nodeType: "buyer",
    lat: 9.9590, lng: -84.0740, neighborhood: "Tibás", status: "available",
    maxPriceUsdc: 0.09, demandPeakHour: 18, demandBaseKwh: 2.5,
    reliabilityScore: 0.91, availableFrom: 7, availableTo: 21,
  },
];

/**
 * Returns the current demand for a buyer at a given hour.
 * Bell curve centered on their demandPeakHour.
 */
export function getBuyerDemand(buyer: BuyerProfile, hour: number): number {
  if (hour < buyer.availableFrom || hour > buyer.availableTo) return 0;

  // Bell curve centered on peak hour, ±4 hour spread
  const dist = Math.abs(hour - buyer.demandPeakHour);
  const factor = Math.exp(-0.5 * (dist / 3) ** 2); // gaussian
  const demand = buyer.demandBaseKwh * factor;

  // ±15% random variation
  return parseFloat((demand * (0.85 + Math.random() * 0.3)).toFixed(2));
}

/**
 * Returns whether a buyer is available at the given hour.
 */
export function isBuyerAvailable(buyer: BuyerProfile, hour: number): boolean {
  return hour >= buyer.availableFrom && hour <= buyer.availableTo;
}

// ─── Prosumer Profiles (unchanged) ───

export const MOCK_PROSUMER_PROFILES: MicroGridNode[] = [
  {
    id: "prosumer_001", displayName: "Casa Solar #1", nodeType: "prosumer",
    lat: 9.9341, lng: -84.0877, neighborhood: "Escazú", status: "available",
    panelCapacityKw: 5.0, currentKwhAvailable: 2.8,
  },
  {
    id: "prosumer_002", displayName: "Casa Solar #2", nodeType: "prosumer",
    lat: 9.9367, lng: -84.0782, neighborhood: "Sabana", status: "available",
    panelCapacityKw: 4.2, currentKwhAvailable: 1.9,
  },
  {
    id: "prosumer_003", displayName: "Casa Solar #3", nodeType: "prosumer",
    lat: 9.9531, lng: -84.0423, neighborhood: "Moravia", status: "available",
    panelCapacityKw: 6.0, currentKwhAvailable: 3.5,
  },
  {
    id: "prosumer_004", displayName: "Casa Solar #4", nodeType: "prosumer",
    lat: 9.9184, lng: -84.0375, neighborhood: "Curridabat", status: "available",
    panelCapacityKw: 3.8, currentKwhAvailable: 2.1,
  },
  {
    id: "prosumer_005", displayName: "Casa Solar #5", nodeType: "prosumer",
    lat: 9.9282, lng: -84.1261, neighborhood: "Santa Ana", status: "available",
    panelCapacityKw: 7.5, currentKwhAvailable: 4.2,
  },
];

// ─── All Nodes Combined ───

export const ALL_NODES: MicroGridNode[] = [
  ...MOCK_PROSUMER_PROFILES,
  ...MOCK_BUYERS,
];

// ─── Smart Meter Reading Generator ───

/**
 * Generates a realistic meter reading using the solar simulation engine.
 * Takes current hour and optional minute for sub-hour granularity.
 */
export function generateMeterReading(hour: number, minute: number = 0): MeterReading {
  // Solar generation from irradiance model
  const irr = solarIrradiance(hour, minute);
  const generated = parseFloat((PANEL_CAPACITY_KW * irr).toFixed(2));

  // Consumption from pattern model
  const consumed = parseFloat(getConsumptionForHour(hour).toFixed(2));

  // Surplus: what's available to sell
  const surplus = parseFloat(Math.max(0, generated - consumed).toFixed(2));

  // 6-hour forecast
  const forecastArray = generateForecast(hour, minute);
  const forecastKwh = parseFloat(forecastArray.reduce((a, b) => a + b, 0).toFixed(2));

  // Count available buyers based on time of day
  const currentHour = hour;
  const availableBuyers = MOCK_BUYERS.filter((b) => isBuyerAvailable(b, currentHour));
  const buyersAvailable = availableBuyers.length;

  // Dynamic pricing
  const suggestedPrice = calculatePrice(surplus, buyersAvailable);

  return {
    generatedKwh: generated,
    consumedKwh: consumed,
    surplusKwh: surplus,
    forecastKwh,
    suggestedPriceUsdc: suggestedPrice,
    buyersAvailable,
    source: "mock",
    timestamp: new Date().toISOString(),
  };
}

// ─── Demo Defaults ───

/** Default prosumer for the demo (Casa Solar #1 in Escazú) */
export const DEMO_PROSUMER = MOCK_PROSUMER_PROFILES[0];

/** Default reading at demo time (11am — good solar production) */
export const DEMO_METER_READING = generateMeterReading(11);

/**
 * Returns a demo-safe hour/minute pair.
 * During nighttime (before 6am / after 6pm), returns 11:30 AM
 * so the demo always shows productive solar generation.
 */
export function getDemoSafeTime(demoHour: number | null): { hour: number; minute: number } {
  if (demoHour != null) return { hour: demoHour, minute: 30 };
  const now = new Date();
  const hour = now.getHours();
  if (hour < 6 || hour > 18) return { hour: 11, minute: 30 };
  return { hour, minute: now.getMinutes() };
}

/** Price that CNFL pays (for the "5x more" comparator) */
export const CNFL_PRICE_PER_KWH = 0.017; // ₡9.56 ≈ $0.017 USD

/** CO2 factor for Costa Rica grid */
export const CO2_FACTOR_KG_PER_KWH = 0.249;

/** Protocol routing fee */
export const PROTOCOL_FEE_RATE = 0.001; // 0.1%

/** Session weather info (exposed for UI display) */
export const SESSION_WEATHER = {
  cloudFactor: SESSION_CLOUD_FACTOR,
  tempFactor: SESSION_TEMP_FACTOR,
  condition: SESSION_CLOUD_FACTOR > 0.9 ? "clear" as const
    : SESSION_CLOUD_FACTOR > 0.75 ? "partly_cloudy" as const
    : "overcast" as const,
};

// ─── Heatmap Generator (date-seeded) ───

/**
 * Generates a deterministic heatmap grid seeded by the current date.
 * Same day = same data, different day = different data.
 */
export function generateHeatmapData(weeks: number = 12): number[][] {
  // Simple seeded PRNG based on date
  const today = new Date();
  let seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  function seededRandom(): number {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 1000) / 1000;
  }

  const data: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const r = seededRandom();
      // Weekdays (1–5) have more activity than weekends
      const isWeekday = d >= 1 && d <= 5;
      // Recent weeks have more activity (growth trend)
      const recencyBoost = 0.5 + (w / weeks) * 0.5;

      if (r < 0.25 * recencyBoost) week.push(0);
      else if (r < 0.5) week.push(isWeekday ? 1 : 0);
      else if (r < 0.75) week.push(isWeekday ? 2 : 1);
      else if (r < 0.9) week.push(isWeekday ? 3 : 2);
      else week.push(isWeekday ? 4 : 3);
    }
    data.push(week);
  }
  return data;
}

/**
 * Generates a monthly trend sparkline seeded by current month.
 */
export function generateMonthlyTrend(): number[] {
  const today = new Date();
  let seed = today.getFullYear() * 100 + today.getMonth();

  function seededRandom(): number {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 1000) / 1000;
  }

  const trend: number[] = [];
  let value = 0.8 + seededRandom() * 1.5;
  for (let m = 0; m < 12; m++) {
    // General upward trend with noise
    value = Math.max(0.3, value + (seededRandom() - 0.35) * 1.8);
    trend.push(parseFloat(value.toFixed(1)));
  }
  return trend;
}
