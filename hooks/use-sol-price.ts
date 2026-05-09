import { useState, useEffect, useRef, useCallback } from "react";
import { fetchSolPrice, type PythPrice } from "@/lib/pyth-price";

/**
 * useSolPrice — Hook for real-time SOL/USD price via Pyth Network.
 * Polls every `intervalMs` (default 15s). Returns price, source, and loading state.
 */

interface UseSolPriceOptions {
  intervalMs?: number;
  enabled?: boolean;
}

interface UseSolPriceReturn {
  price: number | null;
  confidence: number;
  source: PythPrice["source"];
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useSolPrice(options: UseSolPriceOptions = {}): UseSolPriceReturn {
  const { intervalMs = 15000, enabled = true } = options;

  const [data, setData] = useState<PythPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const result = await fetchSolPrice();
      setData(result);
    } catch {
      // Keep previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchPrice();

    // Set up polling
    intervalRef.current = setInterval(fetchPrice, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs, fetchPrice]);

  return {
    price: data?.price ?? null,
    confidence: data?.confidence ?? 0,
    source: data?.source ?? "fallback",
    loading,
    lastUpdated: data ? new Date(data.timestamp) : null,
    refresh: fetchPrice,
  };
}
