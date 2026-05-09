// ═══════════════════════════════════════════════
// Lumos — Shared TypeScript Types
// Source: 003-DATA_MODEL.md
// ═══════════════════════════════════════════════

// ─── Meter & Energy ───

export interface MeterReading {
  generatedKwh: number;
  consumedKwh: number;
  surplusKwh: number;
  forecastKwh: number;
  suggestedPriceUsdc: number;
  buyersAvailable: number;
  source: "mock" | "live";
  timestamp: string; // ISO
}

export interface MeterContext {
  current_kwh: number;
  surplus_kwh: number;
  forecast_kwh: number;
  suggested_price: number;
  buyers_available: number;
}

// ─── Intelligence Service ───

export interface ForecastResult {
  mean_predictions: number[];    // Point forecast (6h ahead)
  quantiles_p10: number[];       // Lower bound
  quantiles_p90: number[];       // Upper bound
  horizon_hours: number;
}

export interface MatchResult {
  buyer_id: string;
  buyer_name: string;
  distance_m: number;
  demand_kwh: number;
  max_price: number;
  confidence: number; // 0-1
  neighborhood: string;
}

// ─── Trade Proposals ───

export type ProposalStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "ON_CHAIN"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export interface TradeProposal {
  id: string;
  prosumerId: string;
  buyerId: string;
  buyerName: string;
  kwhAmount: number;
  pricePerKwh: number;
  totalUsdc: number;
  feeUsdc: number;       // 0.1% routing fee
  netUsdc: number;       // totalUsdc - feeUsdc
  status: ProposalStatus;
  createdAt: string;     // ISO
  expiresAt: string;     // ISO (10 min TTL)
  vaultPda?: string;
  txHash?: string;
}

// ─── Solei Chat ───

export type SoleiRole = "user" | "assistant" | "system";

export interface SoleiMessage {
  id: string;
  role: SoleiRole;
  content: string;
  timestamp: string;       // ISO
  proposal?: TradeProposal; // Attached when Solei proposes a trade
}

export interface SoleiSession {
  id: string;
  messages: SoleiMessage[];
  meterContext: MeterContext | null;
  activeProposal: TradeProposal | null;
  createdAt: string;
  lastActivity: string;
}

// ─── SSE Events ───

export type SSEEventType = "text" | "proposal" | "done" | "error";

export interface SSEEvent {
  type: SSEEventType;
  content?: string;
  proposal?: {
    action: "sell";
    kwh: number;
    price: number;
    buyer: string;
    buyer_name: string;
    total_usdc: number;
  };
  error?: string;
}

// ─── Micro-Grid Map ───

export type NodeType = "prosumer" | "buyer";
export type NodeStatus = "available" | "trading" | "offline" | "full";

export interface MicroGridNode {
  id: string;
  displayName: string;
  nodeType: NodeType;
  lat: number;
  lng: number;
  neighborhood: string;
  status: NodeStatus;
  currentKwhAvailable?: number;  // Only prosumers
  panelCapacityKw?: number;      // Only prosumers
  maxPriceUsdc?: number;         // Only buyers
}

export interface ActiveTransaction {
  id: string;
  from: string;  // prosumer node id
  to: string;    // buyer node id
  kwh: number;
  totalUsdc: number;
  status: "pending" | "confirmed" | "failed";
  timestamp: string;
}

// ─── On-Chain (NexusVault) ───

export type VaultStatus =
  | "Initialized"
  | "FundsLocked"
  | "DeliveryConfirmed"
  | "Completed"
  | "Cancelled";

export interface VaultState {
  prosumer: string;     // Pubkey
  buyer: string;        // Pubkey
  kwhAmount: number;
  pricePerKwh: number;  // lamports USDC
  totalUsdc: number;    // lamports USDC
  feeUsdc: number;
  status: VaultStatus;
  createdAt: number;    // Unix timestamp
  timeoutAt: number;    // Unix timestamp
  meterReading?: {
    meterId: string;
    kwhDelivered: number;
    timestamp: number;
    source: string;
  };
}

// ─── Transaction History ───

export type TransactionStatus = "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED";

export interface TransactionRecord {
  id: string;
  proposalId: string;
  prosumerId: string;
  buyerId: string;
  kwhDelivered: number;
  pricePerKwhUsdc: number;
  grossUsdc: number;
  feeUsdc: number;
  netUsdc: number;
  vaultPda: string;
  txHash: string;
  status: TransactionStatus;
  co2AvoidedKg: number;  // kWh * 0.249
  createdAt: string;
  completedAt?: string;
}
