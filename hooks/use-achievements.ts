import { useMemo } from "react";
import { useTransactionStore } from "@/stores";
import { CO2_FACTOR_KG_PER_KWH } from "@/lib/mock-data";
import {
  SunIcon, BoltIcon, BatteryIcon, LeafIcon, HomeIcon, DiamondIcon
} from "@/components/ui/pixel-icons";

/**
 * useAchievements — Evaluates unlocked achievements dynamically
 * based on the transaction store. Each badge has a threshold
 * that the user must reach to unlock it.
 * Icons are pixel SVG component references (not emoji strings).
 */

export interface Achievement {
  id: string;
  labelKey: string;
  IconComponent: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  color: string;
  unlocked: boolean;
  progress: number; // 0–1
  description: string;
}

interface AchievementDef {
  id: string;
  labelKey: string;
  IconComponent: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  color: string;
  description: string;
  evaluate: (stats: TxStats) => { unlocked: boolean; progress: number };
}

interface TxStats {
  totalTrades: number;
  totalKwh: number;
  totalUsdc: number;
  totalCo2Kg: number;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_sale",
    labelKey: "badge.first_sale",
    IconComponent: SunIcon,
    color: "#F97316",
    description: "Completa tu primera venta",
    evaluate: (s) => ({ unlocked: s.totalTrades >= 1, progress: Math.min(1, s.totalTrades / 1) }),
  },
  {
    id: "10_trades",
    labelKey: "badge.10_trades",
    IconComponent: BoltIcon,
    color: "#FBBF24",
    description: "Realiza 10 intercambios",
    evaluate: (s) => ({ unlocked: s.totalTrades >= 10, progress: Math.min(1, s.totalTrades / 10) }),
  },
  {
    id: "100_kwh",
    labelKey: "badge.100_kwh",
    IconComponent: BatteryIcon,
    color: "#22C55E",
    description: "Vende 100 kWh de energía solar",
    evaluate: (s) => ({ unlocked: s.totalKwh >= 100, progress: Math.min(1, s.totalKwh / 100) }),
  },
  {
    id: "1_ton_co2",
    labelKey: "badge.1_ton_co2",
    IconComponent: LeafIcon,
    color: "#10B981",
    description: "Evita 1 tonelada de CO₂",
    evaluate: (s) => ({ unlocked: s.totalCo2Kg >= 1000, progress: Math.min(1, s.totalCo2Kg / 1000) }),
  },
  {
    id: "top_neighbor",
    labelKey: "badge.top_neighbor",
    IconComponent: HomeIcon,
    color: "#3B82F6",
    description: "Sé el vecino #1 de tu zona",
    evaluate: (s) => ({ unlocked: s.totalTrades >= 20 && s.totalKwh >= 50, progress: Math.min(1, (s.totalTrades + s.totalKwh) / 70) }),
  },
  {
    id: "100_usdc",
    labelKey: "badge.100_usdc",
    IconComponent: DiamondIcon,
    color: "#8B5CF6",
    description: "Gana $100 USDC vendiendo energía",
    evaluate: (s) => ({ unlocked: s.totalUsdc >= 100, progress: Math.min(1, s.totalUsdc / 100) }),
  },
];

export function useAchievements(): Achievement[] {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    const stats: TxStats = {
      totalTrades: transactions.length,
      totalKwh: transactions.reduce((sum, tx) => sum + tx.kwhDelivered, 0),
      totalUsdc: transactions.reduce((sum, tx) => sum + tx.netUsdc, 0),
      totalCo2Kg: transactions.reduce((sum, tx) => sum + (tx.co2AvoidedKg || tx.kwhDelivered * CO2_FACTOR_KG_PER_KWH), 0),
    };

    return ACHIEVEMENT_DEFS.map((def) => {
      const { unlocked, progress } = def.evaluate(stats);
      return {
        id: def.id,
        labelKey: def.labelKey,
        IconComponent: def.IconComponent,
        color: def.color,
        unlocked,
        progress,
        description: def.description,
      };
    });
  }, [transactions]);
}
