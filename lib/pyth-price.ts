/**
 * Pyth Price Oracle — Fetches SOL/USD price from Pyth Hermes API.
 * Free, no API key required. Uses REST endpoint with polling.
 * Fallback to CoinGecko simple price API if Pyth is unavailable.
 */

// SOL/USD Price Feed ID on Pyth
const SOL_USD_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
const HERMES_URL = "https://hermes.pyth.network/v2/updates/price/latest";
const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

export interface PythPrice {
  price: number;
  confidence: number;
  timestamp: number;
  source: "pyth" | "coingecko" | "fallback";
}

/**
 * Fetch SOL/USD price from Pyth Hermes API.
 * Returns parsed price with confidence interval.
 */
export async function fetchSolPrice(): Promise<PythPrice> {
  try {
    const res = await fetch(`${HERMES_URL}?ids[]=${SOL_USD_FEED_ID}`, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`Pyth HTTP ${res.status}`);

    const data = await res.json();
    const priceData = data?.parsed?.[0]?.price;

    if (!priceData) throw new Error("No price data in Pyth response");

    // Pyth returns price as integer with exponent
    const price = Number(priceData.price) * Math.pow(10, priceData.expo);
    const confidence = Number(priceData.conf) * Math.pow(10, priceData.expo);

    return {
      price: parseFloat(price.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(4)),
      timestamp: Number(priceData.publish_time) * 1000,
      source: "pyth",
    };
  } catch (pythError) {
    console.warn("Pyth unavailable, trying CoinGecko:", pythError);
    return fetchSolPriceFallback();
  }
}

/**
 * Fallback: CoinGecko simple price API (no key, rate limited).
 */
async function fetchSolPriceFallback(): Promise<PythPrice> {
  try {
    const res = await fetch(COINGECKO_URL, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);

    const data = await res.json();
    const price = data?.solana?.usd;

    if (!price) throw new Error("No price in CoinGecko response");

    return {
      price: parseFloat(price.toFixed(2)),
      confidence: 0,
      timestamp: Date.now(),
      source: "coingecko",
    };
  } catch {
    // Ultimate fallback — hardcoded reasonable price
    return {
      price: 168.50,
      confidence: 0,
      timestamp: Date.now(),
      source: "fallback",
    };
  }
}
