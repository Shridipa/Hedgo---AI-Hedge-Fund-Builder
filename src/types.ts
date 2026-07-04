/**
 * Shared Type Definitions for Quant Arena: The Algorithmic War
 */

export enum MarketRegimeType {
  BULL = "BULL",
  BEAR = "BEAR",
  RECESSION = "RECESSION",
  INFLATION_SHOCK = "INFLATION_SHOCK",
  TECH_BUBBLE = "TECH_BUBBLE",
  AI_REVOLUTION = "AI_REVOLUTION",
  FINANCIAL_CRISIS = "FINANCIAL_CRISIS",
  BLACK_SWAN = "BLACK_SWAN"
}

export enum AssetCategory {
  EQUITIES = "EQUITIES",
  CRYPTO = "CRYPTO",
  COMMODITIES = "COMMODITIES",
  BONDS = "BONDS",
  ALTERNATIVES = "ALTERNATIVES"
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  sector: string;
  price: number;
  change: number; // monthly change in percentage
  volatility: number; // annual
  drift: number; // expected return rate
  marketCap: number; // in Millions
  beta: number; // relative to benchmark S&P 500
  history6m: number[]; // 6-month historical returns (%)
}

export interface Portfolio {
  allocations: { [assetId: string]: number }; // percentage (0 - 100)
  leverage: number; // e.g. 1.0 (no leverage) to 3.0
  cash: number; // Dollar amount
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  impactType: "all" | "crypto" | "commodities" | "tech" | "crisis";
  severity: "low" | "medium" | "high" | "catastrophic";
  duration: number; // in months
  effect: {
    volatilityMultiplier: number;
    driftOffset: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  style: string;
  aum: number; // in Millions
  reputation: number; // 0 - 100
  monthlyReturn: number; // percentage
  sharpeRatio: number;
  isPlayer: boolean;
  specialAbility: string;
}

export interface HistoricalRecord {
  month: number;
  year: number;
  aum: number;
  cash: number;
  returnRate: number;
  sharpe: number;
  regime: MarketRegimeType;
  benchmarkReturn: number;
}

export interface InvestorType {
  id: string;
  name: string;
  description: string;
  minSharpe: number;
  minReputation: number;
  sharePercent: number; // percentage of player inflows
  volatilityTolerance: "low" | "medium" | "high";
  currentConfidence: number; // 0 - 100
  totalInvested: number; // Millions
}

export interface MLModel {
  id: string;
  name: string;
  type: string;
  trained: boolean;
  accuracy: number; // percentage
  boost: number; // returns boost factor
  logs: string[];
}

export interface StrategySignal {
  id: string;
  name: string;
  category: "technical" | "fundamental" | "sentiment";
  description: string;
  active: boolean;
}

export interface StrategyFilter {
  id: string;
  name: string;
  category: "sector" | "marketCap" | "volatility";
  value: string;
  active: boolean;
}

export interface StrategyRule {
  id: string;
  name: string;
  value: number;
  active: boolean;
}

export interface CustomStrategy {
  signals: StrategySignal[];
  filters: StrategyFilter[];
  rules: StrategyRule[];
}

export interface GameState {
  month: number;
  year: number;
  aum: number; // Millions
  reputation: number; // 0 - 100
  regime: MarketRegimeType;
  activeEvents: GameEvent[];
  portfolio: Portfolio;
  assets: Asset[];
  history: HistoricalRecord[];
  leaderboard: LeaderboardEntry[];
  investors: InvestorType[];
  mlModels: MLModel[];
  customStrategy: CustomStrategy;
  currentTurnComplete: boolean;
  unlockedElite: boolean;
  finalBossBeaten: boolean;
  gameStatus: "active" | "won" | "lost";
}
