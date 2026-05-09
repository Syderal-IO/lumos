/**
 * Forecast Utils — Generates solar forecast data for the ForecastCard.
 * Uses the same bell-curve model as intelligence.ts but returns a simpler format.
 */

import { solarIrradiance } from "./mock-data";

interface ForecastData {
  mean: number[];
  p10: number[];
  p90: number[];
}

/**
 * Generate a 6-hour solar forecast from a given starting hour.
 * Returns mean, p10, and p90 arrays for confidence visualization.
 */
export function smartForecastFromHour(startHour: number, horizon: number = 6): ForecastData {
  const mean: number[] = [];
  const p10: number[] = [];
  const p90: number[] = [];

  for (let i = 1; i <= horizon; i++) {
    const futureHour = startHour + i;
    const irr = solarIrradiance(futureHour, 30);

    const predicted = Math.max(0, 5.0 * irr);
    const uncertaintySpread = 0.08 * i;

    mean.push(parseFloat(predicted.toFixed(2)));
    p10.push(parseFloat(Math.max(0, predicted * (1 - uncertaintySpread)).toFixed(2)));
    p90.push(parseFloat((predicted * (1 + uncertaintySpread)).toFixed(2)));
  }

  return { mean, p10, p90 };
}
