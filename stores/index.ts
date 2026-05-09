// ═══════════════════════════════════════════════
// Lumos — Zustand Stores
// Global state management for the application
// ═══════════════════════════════════════════════

import { create } from "zustand";
import type {
  SoleiMessage,
  TradeProposal,
  MeterReading,
  ForecastResult,
  TransactionRecord,
  MicroGridNode,
  ActiveTransaction,
} from "@/lib/types";

// ─── Solei Chat Store ───

interface SoleiState {
  messages: SoleiMessage[];
  isStreaming: boolean;
  activeProposal: TradeProposal | null;
  sessionId: string;

  addMessage: (msg: SoleiMessage) => void;
  updateLastAssistant: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setActiveProposal: (proposal: TradeProposal | null) => void;
  resetSession: () => void;
}

// Generate session ID lazily to avoid SSR hydration mismatch
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export const useSoleiStore = create<SoleiState>((set) => ({
  messages: [],
  isStreaming: false,
  activeProposal: null,
  sessionId: generateSessionId(),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastAssistant: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content };
      }
      return { messages: msgs };
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setActiveProposal: (proposal) => set({ activeProposal: proposal }),

  resetSession: () =>
    set({
      messages: [],
      isStreaming: false,
      activeProposal: null,
      sessionId: generateSessionId(),
    }),
}));

// ─── Meter Store ───

interface MeterState {
  currentReading: MeterReading | null;
  history: MeterReading[];
  forecast: ForecastResult | null;
  /** Override hour for demo mode (null = use real clock) */
  demoHour: number | null;

  setCurrentReading: (reading: MeterReading) => void;
  addToHistory: (reading: MeterReading) => void;
  setForecast: (forecast: ForecastResult) => void;
  setDemoHour: (hour: number | null) => void;
}

export const useMeterStore = create<MeterState>((set) => ({
  currentReading: null,
  history: [],
  forecast: null,
  demoHour: null,

  setCurrentReading: (reading) => set({ currentReading: reading }),

  addToHistory: (reading) =>
    set((s) => ({
      history: [...s.history.slice(-23), reading], // Keep last 24 readings
    })),

  setForecast: (forecast) => set({ forecast }),
  setDemoHour: (hour) => set({ demoHour: hour }),
}));

// ─── Transaction Store ───

interface TransactionState {
  transactions: TransactionRecord[];
  pendingTx: string | null; // tx hash being processed
  feed: Array<{
    id: string;
    message: string;
    type: "success" | "pending" | "error";
    timestamp: string;
  }>;

  addTransaction: (tx: TransactionRecord) => void;
  updateTransaction: (id: string, updates: Partial<TransactionRecord>) => void;
  setPendingTx: (hash: string | null) => void;
  addFeedItem: (item: TransactionState["feed"][0]) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  pendingTx: null,
  feed: [],

  addTransaction: (tx) =>
    set((s) => ({ transactions: [tx, ...s.transactions] })),

  updateTransaction: (id, updates) =>
    set((s) => ({
      transactions: s.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    })),

  setPendingTx: (hash) => set({ pendingTx: hash }),

  addFeedItem: (item) =>
    set((s) => ({
      feed: [item, ...s.feed].slice(0, 50), // Keep last 50 items
    })),
}));

// ─── Map Store ───

interface MapState {
  nodes: MicroGridNode[];
  activeTransactions: ActiveTransaction[];
  center: [number, number]; // [lng, lat]
  zoom: number;

  setNodes: (nodes: MicroGridNode[]) => void;
  updateNodeStatus: (nodeId: string, status: MicroGridNode["status"]) => void;
  addActiveTransaction: (tx: ActiveTransaction) => void;
  removeActiveTransaction: (txId: string) => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  nodes: [],
  activeTransactions: [],
  center: [-84.0877, 9.9341], // Escazú, Costa Rica [lng, lat]
  zoom: 13,

  setNodes: (nodes) => set({ nodes }),

  updateNodeStatus: (nodeId, status) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === nodeId ? { ...n, status } : n
      ),
    })),

  addActiveTransaction: (tx) =>
    set((s) => ({
      activeTransactions: [...s.activeTransactions, tx],
    })),

  removeActiveTransaction: (txId) =>
    set((s) => ({
      activeTransactions: s.activeTransactions.filter((t) => t.id !== txId),
    })),

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
}));
