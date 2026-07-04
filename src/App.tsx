import { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  Cpu, 
  ShieldAlert, 
  Terminal, 
  Users, 
  Sliders, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  TrendingDown, 
  HelpCircle, 
  Zap, 
  Award, 
  AlertCircle,
  Play,
  Lock,
  LineChart,
  Check,
  ChevronUp,
  Scale,
  Briefcase,
  DollarSign,
  Percent,
  Clock,
  ShieldCheck,
  Target,
  ArrowRightLeft,
  ChevronDown,
  Sparkles,
  Info
} from "lucide-react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  Label
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { 
  MarketRegimeType, 
  AssetCategory, 
  Asset, 
  Portfolio, 
  GameEvent, 
  LeaderboardEntry, 
  HistoricalRecord, 
  InvestorType, 
  MLModel, 
  CustomStrategy, 
  GameState 
} from "./types";

export interface CareerMilestone {
  id: string;
  title: string;
  badge: string;
  description: string;
  metricType: "aum" | "reputation";
  threshold: number;
  unlockedTitle: string;
  rewardText: string;
}

export const MILESTONES: CareerMilestone[] = [
  {
    id: "ms_rep_30",
    title: "Rogue Operator",
    badge: "👤",
    description: "Establish a solid reputation inside independent trading nodes.",
    metricType: "reputation",
    threshold: 30,
    unlockedTitle: "Rogue Trader",
    rewardText: "Cosmetic Title: 'ROGUE TRADER' unlocked"
  },
  {
    id: "ms_aum_1b",
    title: "First Billion",
    badge: "🦄",
    description: "Cross $1.00 Billion in total Assets Under Management.",
    metricType: "aum",
    threshold: 1000,
    unlockedTitle: "AUM Unicorn",
    rewardText: "Cosmetic Badge: 'UNICORN 🦄' unlocked"
  },
  {
    id: "ms_rep_60",
    title: "Market Maverick",
    badge: "⚡",
    description: "Achieve high-tier reputation across decentralized sovereign entities.",
    metricType: "reputation",
    threshold: 60,
    unlockedTitle: "Sovereign Maverick",
    rewardText: "Cosmetic Title: 'SOVEREIGN MAVERICK' unlocked"
  },
  {
    id: "ms_aum_10b",
    title: "Deca-Billionaire",
    badge: "🌀",
    description: "Amass more than $10.00 Billion in Assets Under Management.",
    metricType: "aum",
    threshold: 10000,
    unlockedTitle: "Cyber Titan",
    rewardText: "Cosmetic Badge: 'CYBER DECA 🌀' unlocked"
  },
  {
    id: "ms_rep_90",
    title: "Quantitative Deity",
    badge: "🔥",
    description: "Reach elite quantitative reputation, feared and respected by AI systems.",
    metricType: "reputation",
    threshold: 90,
    unlockedTitle: "Quant Archon",
    rewardText: "Cosmetic Title: 'QUANT ARCHON' unlocked"
  },
  {
    id: "ms_aum_100b",
    title: "Financial Sovereign",
    badge: "👑",
    description: "Control over $100.00 Billion AUM, unlocking global credit nodes.",
    metricType: "aum",
    threshold: 100000,
    unlockedTitle: "Sovereign Emperor",
    rewardText: "Cosmetic Badge: 'SYSTEM MASTER 👑' unlocked"
  }
];

export default function App() {
  // Navigation Rooms
  const [activeTab, setActiveTab] = useState<"trading" | "quant" | "risk" | "research" | "investor" | "war" | "milestones">("trading");

  // Milestones local states
  const [unlockedMilestoneIds, setUnlockedMilestoneIds] = useState<string[]>([]);
  const [activeMilestonePopUp, setActiveMilestonePopUp] = useState<CareerMilestone | null>(null);
  const isMilestonesInitialized = useRef(false);

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Asset selection and filters (Trading Floor)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  
  // Selected assets inside our portfolio
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(["as_1", "as_2", "as_3", "as_4", "as_5"]);
  const [localAllocations, setLocalAllocations] = useState<{ [assetId: string]: number }>({});
  const [leverage, setLeverage] = useState<number>(1.0);
  const [optimizationMethod, setOptimizationMethod] = useState<string>("markowitz");
  const [optimizing, setOptimizing] = useState<boolean>(false);

  // Optimizer Target Tracking (for Rebalance Notification)
  const [optimizedAllocations, setOptimizedAllocations] = useState<{ [assetId: string]: number } | null>({
    "as_1": 25,
    "as_2": 25,
    "as_3": 20,
    "as_4": 15,
    "as_5": 15
  });

  // Simulation, Risk, Backtest, and News Data
  const [simData, setSimData] = useState<any>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [riskData, setRiskData] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState<boolean>(false);
  const [backtestData, setBacktestData] = useState<any>(null);
  const [backtestLoading, setBacktestLoading] = useState<boolean>(false);
  const [newsFeed, setNewsFeed] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(false);

  // ML Training
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [trainingModelId, setTrainingModelId] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);

  // Research Droid (Gemini) Macro Reports
  const [researchReport, setResearchReport] = useState<string>("");
  const [researchQuery, setResearchQuery] = useState<string>("");
  const [researchLoading, setResearchLoading] = useState<boolean>(false);

  // General state feedback & overlays
  const [showOutcomeModal, setShowOutcomeModal] = useState<boolean>(false);
  const [lastStateSnapshot, setLastStateSnapshot] = useState<GameState | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "Quant Command Mainframe initialized...",
    "Institutional secure link established.",
    "Awaiting market allocation parameters."
  ]);

  // Fetch initial game state from API / server setup
  useEffect(() => {
    async function initializeGame() {
      try {
        setLoading(true);
        const response = await fetch("/api/market");
        if (!response.ok) throw new Error("Failed to contact market transceiver.");
        const data = await response.json();
        
        const initialSnapshot: GameState = {
          month: 7,
          year: 2045,
          aum: 100,
          reputation: 15,
          regime: MarketRegimeType.BULL,
          activeEvents: [],
          portfolio: {
            allocations: {
              "as_1": 25,
              "as_2": 25,
              "as_3": 20,
              "as_4": 15,
              "as_5": 15
            },
            leverage: 1.0,
            cash: 0
          },
          assets: data.assets.slice(0, 50),
          history: [
            { month: 6, year: 2045, aum: 100, cash: 0, returnRate: 0.0, sharpe: 0.0, regime: MarketRegimeType.BULL, benchmarkReturn: 0.0 }
          ],
          leaderboard: [
            { rank: 1, id: "nexus_ai", name: "Nexus AI Core", style: "Hybrid Superintelligence (FINAL BOSS)", aum: 750000, reputation: 100, monthlyReturn: 3.4, sharpeRatio: 3.8, isPlayer: false, specialAbility: "Self-Evolving Models" },
            { rank: 2, id: "omega_alpha", name: "Omega Alpha Quant", style: "Machine Learning Arbitrage", aum: 220000, reputation: 85, monthlyReturn: 1.8, sharpeRatio: 2.9, isPlayer: false, specialAbility: "Strategy Copy" },
            { rank: 3, id: "phoenix_global", name: "Phoenix Global Macro", style: "Macro Tactical Investing", aum: 110000, reputation: 78, monthlyReturn: 1.2, sharpeRatio: 2.2, isPlayer: false, specialAbility: "Crisis Prediction" },
            { rank: 4, id: "titan_capital", name: "Titan Capital Trend", style: "Hyper-Momentum Trading", aum: 85000, reputation: 70, monthlyReturn: 2.8, sharpeRatio: 1.5, isPlayer: false, specialAbility: "Trend Domination" },
            { rank: 5, id: "quantum_arb", name: "Atlas Macro Arb", style: "Statistical Market Neutral", aum: 62000, reputation: 64, monthlyReturn: 0.8, sharpeRatio: 3.2, isPlayer: false, specialAbility: "Market Neutral Shield" },
            { rank: 6, id: "player_fund", name: "The Quant Founder (You)", style: "Custom Quant Algorithm", aum: 100, reputation: 15, monthlyReturn: 0.0, sharpeRatio: 0.0, isPlayer: true, specialAbility: "Human Ingenuity" }
          ],
          investors: [
            { id: "inv_retail", name: "Retail Aggregators", description: "Highly sensitive to short-term returns. Will flood money in during bull runs, but redeem instantly on drawdowns.", minSharpe: 0.5, minReputation: 0, sharePercent: 0.4, volatilityTolerance: "high", currentConfidence: 50, totalInvested: 40 },
            { id: "inv_family", name: "Neo-Gentry Family Offices", description: "Billionaire tech founders looking for alpha. Expect stable returns and high prestige.", minSharpe: 1.2, minReputation: 20, sharePercent: 0.25, volatilityTolerance: "medium", currentConfidence: 40, totalInvested: 30 },
            { id: "inv_endow", name: "Cyber-University Endowments", description: "Long-term horizon. Require sophisticated risk limits and institutional reputation.", minSharpe: 1.5, minReputation: 45, sharePercent: 0.15, volatilityTolerance: "low", currentConfidence: 30, totalInvested: 20 },
            { id: "inv_pension", name: "Mega-Corp Pension Pools", description: "Massive state and corporate pension structures. Require extreme compliance and high Sharpe ratios.", minSharpe: 1.8, minReputation: 60, sharePercent: 0.1, volatilityTolerance: "low", currentConfidence: 10, totalInvested: 10 },
            { id: "inv_sovereign", name: "Neo-Singapore Sovereign Wealth", description: "Unlocks at elite tier. Infinite capital depth, backing only the top-ranked quant firm.", minSharpe: 2.2, minReputation: 80, sharePercent: 0.1, volatilityTolerance: "medium", currentConfidence: 5, totalInvested: 0 }
          ],
          mlModels: [
            { id: "ml_regime", name: "Market Regime Classifier", type: "LightGBM + Random Forest", trained: false, accuracy: 0, boost: 0, logs: [] },
            { id: "ml_returns", name: "Predictive Return Engine", type: "CatBoost Regressor", trained: false, accuracy: 0, boost: 0, logs: [] },
            { id: "ml_risk", name: "GARCH Volatility Forecaster", type: "Monte Carlo Risk Engine", trained: false, accuracy: 0, boost: 0, logs: [] },
            { id: "ml_optim", name: "Black-Litterman Portfolio Optimizer", type: "Quadratic Programming Solver", trained: false, accuracy: 0, boost: 0, logs: [] }
          ],
          customStrategy: {
            signals: [
              { id: "sig_mom", name: "Relative Momentum Indicator", category: "technical", description: "Buy assets with strong 3-month positive trends.", active: false },
              { id: "sig_rsi", name: "RSI Mean Reversion", category: "technical", description: "Buy assets that are oversold (RSI < 30).", active: false },
              { id: "sig_sent", name: "Social Media Sentiment", category: "sentiment", description: "Buy assets trending positively in trading channels.", active: false },
              { id: "sig_pe", name: "Earnings Growth & PE Ratio", category: "fundamental", description: "Buy equities with high growth relative to earnings.", active: false }
            ],
            filters: [
              { id: "filt_tech", name: "Filter Tech Sector", category: "sector", value: "Technology", active: false },
              { id: "filt_crypto", name: "Filter Cryptocurrencies", category: "sector", value: "CRYPTO", active: false },
              { id: "filt_hi_vol", name: "High Volatility Selectors", category: "volatility", value: "high", active: false }
            ],
            rules: [
              { id: "rule_stop", name: "Strict Stop Loss Limit", value: 3.5, active: false },
              { id: "rule_hedge", name: "Tail Risk Hedging", value: 5.0, active: false },
              { id: "rule_lev", name: "Allow Tactical Leverage Limit", value: 2.0, active: false }
            ]
          },
          currentTurnComplete: false,
          unlockedElite: false,
          finalBossBeaten: false,
          gameStatus: "active"
        };

        setGameState(initialSnapshot);
        setLocalAllocations(initialSnapshot.portfolio.allocations);
        setLeverage(initialSnapshot.portfolio.leverage);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to establish secure quantitative terminal.");
        setLoading(false);
      }
    }
    initializeGame();
  }, []);

  // Sync state stats and auto-run calculations when selections or allocations shift
  useEffect(() => {
    if (!gameState) return;
    runRiskAnalytics();
    runMonteCarloSim();
  }, [localAllocations, leverage, gameState?.assets]);

  // Run backtest strategy automatically when strategy settings are updated
  useEffect(() => {
    if (!gameState) return;
    runBacktest();
  }, [
    gameState?.customStrategy.signals.map(s => s.active).join(","),
    gameState?.customStrategy.filters.map(f => f.active).join(","),
    gameState?.customStrategy.rules.map(r => r.active).join(",")
  ]);

  // Fetch News Feed when regime or month changes
  useEffect(() => {
    if (!gameState) return;
    fetchNewsFeed();
  }, [gameState?.month, gameState?.regime]);

  // Initialize completed milestones from initial state without popping them up
  useEffect(() => {
    if (gameState && !isMilestonesInitialized.current) {
      const alreadyCompleted = MILESTONES.filter(ms => {
        if (ms.metricType === "aum") {
          return gameState.aum >= ms.threshold;
        } else {
          return gameState.reputation >= ms.threshold;
        }
      }).map(ms => ms.id);
      setUnlockedMilestoneIds(alreadyCompleted);
      isMilestonesInitialized.current = true;
    }
  }, [gameState]);

  // Check if any milestone is newly unlocked when gameState updates
  useEffect(() => {
    if (!gameState || !isMilestonesInitialized.current) return;

    const newlyUnlocked = MILESTONES.find(ms => {
      const isMet = ms.metricType === "aum" 
        ? gameState.aum >= ms.threshold 
        : gameState.reputation >= ms.threshold;
      
      return isMet && !unlockedMilestoneIds.includes(ms.id);
    });

    if (newlyUnlocked) {
      setUnlockedMilestoneIds(prev => [...prev, newlyUnlocked.id]);
      setActiveMilestonePopUp(newlyUnlocked);
      addSystemLog(`🏆 MILESTONE ACHIEVED: ${newlyUnlocked.title}! ${newlyUnlocked.rewardText}`);
    }
  }, [gameState?.aum, gameState?.reputation, unlockedMilestoneIds]);

  // Fetch Market News Feed from API
  async function fetchNewsFeed() {
    if (!gameState) return;
    try {
      setNewsLoading(true);
      const res = await fetch("/api/research/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRegime: gameState.regime,
          activeEvents: gameState.activeEvents
        })
      });
      if (res.ok) {
        const data = await res.json();
        setNewsFeed(data.news || []);
      }
      setNewsLoading(false);
    } catch (err) {
      console.error("Failed to load market news headlines:", err);
      setNewsLoading(false);
    }
  }

  // Calculate allocation deviation to trigger rebalance notice (difference > 10%)
  const isAllocationDeviated = () => {
    if (!optimizedAllocations) return false;
    let totalDiff = 0;
    let singleAssetDiffOver10 = false;
    
    // Union of all assets
    const allKeys = Array.from(new Set([...Object.keys(localAllocations), ...Object.keys(optimizedAllocations)]));
    for (const key of allKeys) {
      const currentVal = localAllocations[key] || 0;
      const optVal = optimizedAllocations[key] || 0;
      const diff = Math.abs(currentVal - optVal);
      totalDiff += diff;
      if (diff > 10) {
        singleAssetDiffOver10 = true;
      }
    }
    return totalDiff > 10 || singleAssetDiffOver10;
  };

  // Rebalance to target allocation instantly
  const handleInstantRebalance = () => {
    if (!optimizedAllocations) return;
    setLocalAllocations(optimizedAllocations);
    addSystemLog("Rebalanced successfully. Current portfolio weights snapped back to optimized targets.");
  };

  // Post allocations, leverage and strategy parameters to calculate risk statistics
  async function runRiskAnalytics() {
    if (!gameState) return;
    try {
      setRiskLoading(true);
      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations: localAllocations, leverage })
      });
      if (res.ok) {
        const data = await res.json();
        setRiskData(data);
      }
      setRiskLoading(false);
    } catch (err) {
      console.error("Risk analytics error:", err);
      setRiskLoading(false);
    }
  }

  // Post allocations to get future Monte Carlo simulated fan path percentiles
  async function runMonteCarloSim() {
    if (!gameState) return;
    try {
      setSimLoading(true);
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations: localAllocations })
      });
      if (res.ok) {
        const data = await res.json();
        setSimData(data);
      }
      setSimLoading(false);
    } catch (err) {
      console.error("Simulation error:", err);
      setSimLoading(false);
    }
  }

  // Auto-backtest custom strategies
  async function runBacktest() {
    if (!gameState) return;
    try {
      setBacktestLoading(true);
      const res = await fetch("/api/strategy/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy: gameState.customStrategy })
      });
      if (res.ok) {
        const data = await res.json();
        setBacktestData(data);
      }
      setBacktestLoading(false);
    } catch (err) {
      console.error("Backtest failed:", err);
      setBacktestLoading(false);
    }
  }

  // Automatically optimize allocations using selected method
  async function optimizePortfolio() {
    if (!gameState || selectedAssetIds.length === 0) return;
    try {
      setOptimizing(true);
      addSystemLog(`Contacting solver node... Executing [${optimizationMethod.toUpperCase()}] portfolio optimization.`);
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: selectedAssetIds, method: optimizationMethod })
      });
      if (res.ok) {
        const data = await res.json();
        setLocalAllocations(data.allocations);
        setOptimizedAllocations(data.allocations); // store as optimized target!
        addSystemLog(`Optimizer completed. Asset target weights successfully configured.`);
      }
      setOptimizing(false);
    } catch (err) {
      console.error("Failed optimization request:", err);
      setOptimizing(false);
    }
  }

  // Train Machine Learning models
  async function trainMLModel(modelId: string) {
    if (!gameState || trainingModelId) return;
    setTrainingModelId(modelId);
    setTrainingProgress(0);
    setTrainingLogs([]);

    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          completeTrainingOnBackend(modelId);
          return 100;
        }
        return next;
      });
    }, 120);

    async function completeTrainingOnBackend(id: string) {
      try {
        const res = await fetch("/api/ml/train", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modelId: id })
        });
        if (res.ok) {
          const data = await res.json();
          setTrainingLogs(data.logs);
          
          setGameState(prev => {
            if (!prev) return null;
            const nextModels = prev.mlModels.map(m => {
              if (m.id === id) {
                return { ...m, trained: true, accuracy: data.accuracy, boost: data.boost };
              }
              return m;
            });
            return { ...prev, mlModels: nextModels };
          });

          addSystemLog(`Model [${id.toUpperCase()}] successfully trained to ${data.accuracy}% accuracy.`);
        }
        setTrainingModelId(null);
      } catch (err) {
        setTrainingModelId(null);
      }
    }
  }

  // Generate strategic report from Research Department using Gemini API / custom fallback
  async function generateResearchReport() {
    if (!gameState) return;
    try {
      setResearchLoading(true);
      setResearchReport("");
      addSystemLog("Connecting satellite transceiver to quantitative intelligence agency core...");
      const res = await fetch("/api/research/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRegime: gameState.regime,
          aum: gameState.aum,
          reputation: gameState.reputation,
          promptQuery: researchQuery
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResearchReport(data.report);
        addSystemLog("Strategic macro report downloaded successfully.");
      } else {
        setResearchReport("### CONNECTION TIMEOUT.\n\nFailed to download strategic report assets. Please try again.");
      }
      setResearchLoading(false);
    } catch (err) {
      setResearchReport("### CONNECTION ERROR.\n\nFailed to establish connection. Secure port rejected handshakes.");
      setResearchLoading(false);
    }
  }

  // Execute Core Month Turn Simulation (Submit allocations to trade)
  async function submitMonthlyTrade() {
    if (!gameState) return;

    const totalWeights = (Object.values(localAllocations) as number[]).reduce((a: number, b: number) => a + b, 0);
    if (totalWeights > 100) {
      alert("WARNING: Allocated weights exceed 100%. Please rebalance to continue.");
      return;
    }

    try {
      setLoading(true);
      setLastStateSnapshot(gameState);
      
      const payloadState = {
        ...gameState,
        portfolio: {
          allocations: localAllocations,
          leverage,
          cash: gameState.aum * (1 - totalWeights / 100)
        }
      };

      addSystemLog(`Broadcasting transaction matrices to matching engines...`);

      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameState: payloadState })
      });

      if (res.ok) {
        const nextState = await res.json();
        setGameState(nextState);
        setLocalAllocations(nextState.portfolio.allocations);
        setLeverage(nextState.portfolio.leverage);
        
        // Reset target allocations to match next month's allocation baseline
        setOptimizedAllocations(nextState.portfolio.allocations);

        const returnChange = nextState.history[nextState.history.length - 1].returnRate;
        const profitLossDollars = nextState.aum - lastStateSnapshot!.aum;
        const colorPrefix = returnChange >= 0 ? "+" : "";
        
        addSystemLog(`[TURN COMPLETED] Monthly performance: ${colorPrefix}${returnChange}%. Net Asset Flow: ${colorPrefix}$${profitLossDollars.toFixed(2)}M.`);
        setShowOutcomeModal(true);
      } else {
        alert("Transaction routing failure. Please try again.");
      }
      setLoading(false);
    } catch (err) {
      alert("Network timeout. Ensure development server is online.");
      setLoading(false);
    }
  }

  // Reset Game back to baseline
  function handleResetGame() {
    if (confirm("Reset current career? This will clear all fund stats and restart your progression.")) {
      window.location.reload();
    }
  }

  // Helper log systems
  function addSystemLog(msg: string) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSystemLogs(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 35)]);
  }

  // Format currencies
  function formatCurrency(val: number): string {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)} Trillion`;
    }
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(2)} Billion`;
    }
    return `$${val.toFixed(2)} Million`;
  }

  // Quick preset triggers for macro query advice
  const newsPresets = [
    { label: "Optimal asset allocation weights", query: "Give me the optimal asset weights for the current market state to maximize Sharpe." },
    { label: "Risk mitigation rules", query: "What stop-loss and hedging configuration works best under current market parameters?" },
    { label: "Rival analysis strategy", query: "Analyze competitor funds and suggest areas to capture institutional market share." }
  ];

  if (loading && !gameState) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-lg font-semibold text-slate-900 tracking-tight">
          Loading Quant Arena Terminal...
        </div>
        <div className="text-sm text-slate-500 mt-1">Downloading historical vectors and calibrating models</div>
      </div>
    );
  }

  if (!gameState) return null;

  // Compute stats
  const allocatedSum = (Object.values(localAllocations) as number[]).reduce((a: number, b: number) => a + b, 0);
  const cashSum = Math.max(0, 100 - allocatedSum);

  // Sub-navigation view animations variants
  const viewVariants = {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, x: -12, transition: { duration: 0.15, ease: "easeIn" } }
  };

  // Render individual rooms/tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "trading":
        return (
          <motion.div 
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Asset Selection & Universe */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="text-blue-600" size={18} />
                      Asset Universe & Allocations
                    </h3>
                    <p className="text-xs text-slate-500">Configure your active asset weights for the upcoming month.</p>
                  </div>
                  
                  {/* Search and Category Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search symbols..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedSector("ALL");
                      }}
                      className="py-1.5 px-2 border border-slate-200 rounded text-xs bg-slate-50 focus:outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      {Object.values(AssetCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rebalance Warning Banner */}
                {isAllocationDeviated() && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded p-3 flex items-center justify-between text-xs animate-fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-amber-600 shrink-0" size={16} />
                      <div>
                        <span className="font-bold">Portfolio Deviation Alert:</span> Current allocations have drifted by more than 10% from the optimized target model.
                      </div>
                    </div>
                    <button 
                      onClick={handleInstantRebalance}
                      className="ml-3 bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-3 rounded transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <ArrowRightLeft size={12} />
                      Rebalance Now
                    </button>
                  </div>
                )}

                {/* Grid list of assets */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-medium">
                        <th className="py-2.5">Symbol</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Sector</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Change (M/M)</th>
                        <th className="text-center py-2.5 w-32">6M Trend Heatmap</th>
                        <th className="text-center py-2.5 w-16">Select</th>
                        <th className="py-2.5 w-52">Weight Slider</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {gameState.assets
                        .filter(asset => {
                          const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || asset.name.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesCat = selectedCategory === "ALL" || asset.category === selectedCategory;
                          return matchesSearch && matchesCat;
                        })
                        .map(asset => {
                          const isSelected = selectedAssetIds.includes(asset.id);
                          const allocationPercent = localAllocations[asset.id] || 0;
                          return (
                            <tr key={asset.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}>
                              <td className="py-2.5 font-mono font-bold text-slate-900">{asset.symbol}</td>
                              <td className="text-slate-700 truncate max-w-[140px]">{asset.name}</td>
                              <td>
                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                                  {asset.category}
                                </span>
                              </td>
                              <td className="text-slate-500 font-sans">{asset.sector}</td>
                              <td className="text-right font-mono text-slate-900">${asset.price.toFixed(2)}</td>
                              <td className={`text-right font-mono font-medium ${asset.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                {asset.change >= 0 ? "+" : ""}{asset.change}%
                              </td>
                              <td className="py-2.5 text-center">
                                <div className="inline-flex items-center gap-1">
                                  {(asset.history6m || []).map((val, idx) => {
                                    let bgClass = "bg-slate-100";
                                    let tooltipText = `${val > 0 ? "+" : ""}${val}%`;
                                    if (val <= -8) bgClass = "bg-rose-700 text-white";
                                    else if (val < 0) bgClass = "bg-rose-200/80 text-rose-800";
                                    else if (val === 0) bgClass = "bg-slate-100 text-slate-500";
                                    else if (val < 8) bgClass = "bg-emerald-100 text-emerald-800";
                                    else bgClass = "bg-emerald-700 text-white";

                                    return (
                                      <div 
                                        key={idx}
                                        className={`w-4 h-4 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold transition-all hover:scale-115 cursor-help ${bgClass}`}
                                        title={`Month -${6 - idx}: ${tooltipText}`}
                                      >
                                        {val > 0 ? "▲" : val < 0 ? "▼" : "•"}
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="text-center py-2.5">
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                                      setLocalAllocations(prev => {
                                        const next = { ...prev };
                                        delete next[asset.id];
                                        return next;
                                      });
                                    } else {
                                      setSelectedAssetIds(prev => [...prev, asset.id]);
                                      setLocalAllocations(prev => ({ ...prev, [asset.id]: 0 }));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="py-2.5 pr-2">
                                {isSelected ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={allocationPercent}
                                      onChange={(e) => {
                                        const newVal = parseInt(e.target.value) || 0;
                                        setLocalAllocations(prev => ({
                                          ...prev,
                                          [asset.id]: newVal
                                        }));
                                      }}
                                      className="w-full accent-blue-600 cursor-ew-resize"
                                    />
                                    <span className="font-mono font-bold text-slate-900 w-10 text-right">{allocationPercent}%</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Not in portfolio</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Allocation Model, Optimizer, and Leverages */}
            <div className="space-y-6">
              {/* Asset Allocation Model Summary */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Scale className="text-blue-600" size={18} />
                  Model Balancing Block
                </h3>

                <div className="space-y-4">
                  {/* Summary progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Total Capital Allocation</span>
                      <span className={`${allocatedSum > 100 ? 'text-red-600' : 'text-slate-900'}`}>{allocatedSum}% / 100%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${Math.min(100, allocatedSum)}%` }} />
                      <div className="bg-slate-300 h-full transition-all duration-300" style={{ width: `${Math.min(100, cashSum)}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-100 rounded p-2.5 text-center">
                      <div className="text-slate-400 font-medium mb-0.5">ALLOCATED ASSETS</div>
                      <div className="font-mono text-base font-black text-slate-900">{allocatedSum}%</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded p-2.5 text-center">
                      <div className="text-slate-400 font-medium mb-0.5">CASH YIELD POOL</div>
                      <div className="font-mono text-base font-black text-slate-900">{cashSum}%</div>
                    </div>
                  </div>

                  {/* Leverage Adjuster */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 flex items-center gap-1">
                        Gross Portfolio Leverage
                        <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-1 rounded">Caution</span>
                      </span>
                      <span className="font-mono text-blue-600 font-bold">{leverage.toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={leverage}
                      onChange={(e) => setLeverage(parseFloat(e.target.value) || 1.0)}
                      className="w-full accent-blue-600 cursor-ew-resize mb-1"
                    />
                    <p className="text-[10px] text-slate-400">Leverage amplifies gains/losses proportionally. Caps out at 3.0x institutional limits.</p>
                  </div>

                  {/* Quantitative Portfolio Optimization Module */}
                  <div className="border-t border-slate-100 pt-3">
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Automated Optimization Solver</h4>
                    <div className="flex gap-2">
                      <select
                        value={optimizationMethod}
                        onChange={(e) => setOptimizationMethod(e.target.value)}
                        className="flex-1 py-1.5 px-2 border border-slate-200 rounded text-xs bg-slate-50 focus:outline-none"
                      >
                        <option value="markowitz">Markowitz Mean-Variance</option>
                        <option value="parity">Risk Parity Balance</option>
                        <option value="minvol">Minimum Volatility</option>
                        <option value="blacklitterman">Black-Litterman AI Model</option>
                      </select>
                      <button
                        onClick={optimizePortfolio}
                        disabled={optimizing || selectedAssetIds.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold py-1.5 px-3 rounded transition-colors shrink-0 cursor-pointer"
                      >
                        {optimizing ? "Solving..." : "Solve"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Solves the optimal frontier based on asset covariance history.</p>
                  </div>

                  {/* Submit Month Trades */}
                  <div className="border-t border-slate-100 pt-4">
                    <button 
                      onClick={submitMonthlyTrade}
                      disabled={allocatedSum > 100}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded shadow-sm text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={16} />
                      DEPLOY MONTH CAPITAL & EXECUTE SIMULATION
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "quant":
        return (
          <motion.div 
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Custom Strategy Builder */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Cpu className="text-blue-600" size={18} />
                  Visual Algorithmic Strategy Builder
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Construct a visual trading algorithm. Drag-and-click signals, filters, and safety parameters to generate expected model outcomes.
                </p>

                {/* Signals */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">1. Analytical Trigger Signals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {gameState.customStrategy.signals.map(sig => (
                        <div 
                          key={sig.id} 
                          onClick={() => {
                            setGameState(prev => {
                              if (!prev) return null;
                              const nextSigs = prev.customStrategy.signals.map(s => 
                                s.id === sig.id ? { ...s, active: !s.active } : s
                              );
                              return { ...prev, customStrategy: { ...prev.customStrategy, signals: nextSigs } };
                            });
                          }}
                          className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer text-left ${
                            sig.active 
                              ? "bg-blue-50/50 border-blue-400 shadow-sm" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-900">{sig.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              sig.category === "technical" ? "bg-purple-100 text-purple-800" :
                              sig.category === "sentiment" ? "bg-pink-100 text-pink-800" : "bg-cyan-100 text-cyan-800"
                            }`}>
                              {sig.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{sig.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">2. Sector & Universe Filters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {gameState.customStrategy.filters.map(filt => (
                        <div 
                          key={filt.id} 
                          onClick={() => {
                            setGameState(prev => {
                              if (!prev) return null;
                              const nextFilts = prev.customStrategy.filters.map(f => 
                                f.id === filt.id ? { ...f, active: !f.active } : f
                              );
                              return { ...prev, customStrategy: { ...prev.customStrategy, filters: nextFilts } };
                            });
                          }}
                          className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer text-left ${
                            filt.active 
                              ? "bg-blue-50/50 border-blue-400 shadow-sm" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 block mb-1">{filt.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase">Target: {filt.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rules */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">3. Compliance & Risk Rules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {gameState.customStrategy.rules.map(rule => (
                        <div 
                          key={rule.id} 
                          onClick={() => {
                            setGameState(prev => {
                              if (!prev) return null;
                              const nextRules = prev.customStrategy.rules.map(r => 
                                r.id === rule.id ? { ...r, active: !r.active } : r
                              );
                              return { ...prev, customStrategy: { ...prev.customStrategy, rules: nextRules } };
                            });
                          }}
                          className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer text-left ${
                            rule.active 
                              ? "bg-blue-50/50 border-blue-400 shadow-sm" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 block mb-1">{rule.name}</span>
                          <span className="text-[10px] text-slate-500">Value: {rule.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backtest & Machine Learning Models */}
            <div className="space-y-6">
              {/* Backtest Diagnostics */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <LineChart className="text-blue-600" size={16} />
                  Simulated Backtest Diagnostics
                </h3>

                {backtestLoading ? (
                  <div className="py-6 text-center text-xs text-slate-500">Running backtest simulation engine...</div>
                ) : backtestData ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Simulated Sharpe Ratio</span>
                      <span className="font-mono font-bold text-slate-900">{backtestData.sharpeRatio}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Expected Annualized Return</span>
                      <span className="font-mono font-bold text-emerald-600">+{backtestData.annualReturn}%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Max Backtest Drawdown</span>
                      <span className="font-mono font-bold text-red-500">-{backtestData.maxDrawdown}%</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-500">Regulatory Risk Score</span>
                      <span className="font-mono font-bold text-slate-900">{backtestData.riskScore} / 100</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded p-2 text-[10px] text-slate-500">
                      <strong>Optimization Signal:</strong> Activating more rules and signals refines target risk bands, granting return boosts.
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">Configure visual strategy above to run backtest.</div>
                )}
              </div>

              {/* Machine Learning Classifiers */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Sparkles className="text-blue-600" size={16} />
                  Machine Learning Classifiers
                </h3>

                <div className="space-y-3">
                  {gameState.mlModels.map(model => (
                    <div key={model.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900">{model.name}</span>
                        {model.trained ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
                            Trained
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">
                            Untrained
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">Architect: {model.type}</p>
                      
                      {model.trained ? (
                        <div className="flex justify-between items-center text-[11px] font-mono border-t border-slate-100 pt-1.5 mt-1">
                          <span className="text-slate-500">Out-Of-Sample: <strong>{model.accuracy}%</strong></span>
                          <span className="text-emerald-600">Return Boost: <strong>+{Math.round(model.boost * 100)}%</strong></span>
                        </div>
                      ) : (
                        <button
                          onClick={() => trainMLModel(model.id)}
                          disabled={trainingModelId !== null}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-1 px-3 rounded text-[11px] transition-colors cursor-pointer"
                        >
                          {trainingModelId === model.id ? `Training ${trainingProgress}%` : "Train Classifier Model"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "risk":
        // Filter out selected assets to build Scatter data
        const scatterData = gameState.assets
          .filter(a => selectedAssetIds.includes(a.id))
          .map(a => ({
            symbol: a.symbol,
            name: a.name,
            volatility: parseFloat((a.volatility * 100).toFixed(2)), // Convert annual vol to percentage
            drift: parseFloat((a.change).toFixed(2)), // Return rate this month
          }));

        return (
          <motion.div 
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Volatility vs Return Scatter Plot */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <LineChart className="text-blue-600" size={18} />
                    Historical Asset Volatility vs. Expected Returns
                  </h3>
                  <p className="text-xs text-slate-500">
                    A scatter chart representing selected portfolio assets. Low risk, high return is the target efficient frontier.
                  </p>
                </div>

                <div className="h-80 w-full bg-slate-50 rounded-lg p-4 relative border border-slate-100">
                  {scatterData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          type="number" 
                          dataKey="volatility" 
                          name="Volatility" 
                          unit="%"
                          stroke="#64748b"
                          fontSize={11}
                        >
                          <Label value="Annualized Volatility (Risk)" offset={-10} position="insideBottom" fill="#475569" fontSize={11} />
                        </XAxis>
                        <YAxis 
                          type="number" 
                          dataKey="drift" 
                          name="Expected Return" 
                          unit="%" 
                          stroke="#64748b"
                          fontSize={11}
                        >
                          <Label value="Monthly Asset Return Rate" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#475569" fontSize={11} />
                        </YAxis>
                        <RechartsTooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white border border-slate-200 p-2.5 shadow-md rounded text-xs">
                                  <div className="font-bold text-slate-900">{data.name} ({data.symbol})</div>
                                  <div className="text-slate-600 mt-1">Volatility: <span className="font-mono font-bold">{data.volatility}%</span></div>
                                  <div className="text-slate-600">Return Rate: <span className="font-mono font-bold text-emerald-600">{data.drift}%</span></div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Assets" data={scatterData} fill="#2563eb">
                          {scatterData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.drift >= 0 ? '#2563eb' : '#ef4444'} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                      No assets selected in Trading Floor to generate efficient frontier mapping.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Control Parameters & Diagnostics */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldAlert className="text-blue-600" size={18} />
                  Risk Control Center
                </h3>

                {riskLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500">Calculating stress parameters...</div>
                ) : riskData ? (
                  <div className="space-y-4">
                    {/* Risk score gauge helper */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-bold text-slate-600">Stress Risk Score</span>
                        <span className="font-mono font-bold text-slate-900">{riskData.metrics?.riskScore || 45} / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            (riskData.metrics?.riskScore || 45) > 75 ? "bg-red-500" :
                            (riskData.metrics?.riskScore || 45) > 50 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${riskData.metrics?.riskScore || 45}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                      <div className="bg-slate-50 p-2.5 rounded">
                        <span className="text-slate-400 font-medium block">EST. VOLATILITY</span>
                        <span className="font-mono text-base font-black text-slate-900">{riskData.metrics?.portfolioVolatility}%</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded">
                        <span className="text-slate-400 font-medium block">PORTFOLIO BETA</span>
                        <span className="font-mono text-base font-black text-slate-900">{riskData.metrics?.portfolioBeta}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs">
                      <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Info size={14} className="text-blue-500" />
                        Macro Stress Test Scenario
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Under a <strong>financial crash</strong> scenario, this allocation is projected to decline by approximately <strong className="text-red-600">{(riskData.metrics?.maxDrawdown || 12).toFixed(1)}%</strong> over the month. Reallocate into sovereign bonds to buffer drawdowns.
                      </p>
                    </div>

                    {/* Monte Carlo Simulated Paths */}
                    <div className="border-t border-slate-100 pt-3">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">Simulated Asset Fan Paths (Monte Carlo)</h4>
                      {simLoading ? (
                        <div className="text-center text-xs py-2 text-slate-400">Projecting paths...</div>
                      ) : simData ? (
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-500">95th Percentile (Optimistic)</span>
                            <span className="text-emerald-600 font-bold">+{simData.outcomes?.optimistic || "18.2"}%</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-500">50th Percentile (Expected)</span>
                            <span className="text-slate-900 font-bold">+{simData.outcomes?.median || "4.5"}%</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-500">5th Percentile (Severely Bearish)</span>
                            <span className="text-red-500 font-bold">-{simData.outcomes?.pessimistic || "9.8"}%</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400">Select portfolio allocations to generate risk diagnostics.</div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case "research":
        return (
          <motion.div 
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Gemini QIA Macro Report Generator */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Terminal className="text-blue-600" size={18} />
                  Gemini QIA Research Terminal
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Request AI-generated macroeconomic research reports or input custom queries on current regime factors.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Ask Gemini research queries (e.g. 'How should I hedge under inflation?')"
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    className="flex-1 py-2 px-3 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    onClick={generateResearchReport}
                    disabled={researchLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-2 px-4 rounded text-xs transition-all cursor-pointer"
                  >
                    {researchLoading ? "Generating..." : "Generate AI Report"}
                  </button>
                </div>

                {/* News Preset Queries */}
                <div className="mb-4">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">Preset Queries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {newsPresets.map((pr, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setResearchQuery(pr.query);
                          addSystemLog(`Preset query selected: "${pr.label}"`);
                        }}
                        className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] py-1 px-2 rounded-full cursor-pointer transition-colors"
                      >
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Report Frame */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs whitespace-pre-line text-slate-800 leading-relaxed min-h-[220px]">
                  {researchReport ? (
                    <div>{researchReport}</div>
                  ) : researchLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <div className="text-slate-500 animate-pulse text-[11px]">Compiling macro vectors from Gemini models...</div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-center py-12">
                      Request a strategic macro analysis above.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Market News Feed */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock size={16} className="text-blue-600" />
                    Market News Feed
                  </h3>
                  <button 
                    onClick={fetchNewsFeed}
                    disabled={newsLoading}
                    title="Refresh news feed"
                    className="text-slate-500 hover:text-blue-600 disabled:text-slate-300 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} className={newsLoading ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {newsFeed.length > 0 ? (
                    newsFeed.map(news => (
                      <div key={news.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            news.sentiment === "Bullish" ? "bg-emerald-100 text-emerald-800" :
                            news.sentiment === "Bearish" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-800"
                          }`}>
                            {news.sentiment}
                          </span>
                          <span className="text-[10px] text-slate-400">{news.timestamp}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1 leading-snug hover:text-blue-600 transition-colors">
                          {news.title}
                        </h4>
                        <p className="text-slate-500 text-[11px] leading-normal">{news.content}</p>
                        {news.relatedSymbol && (
                          <div className="mt-1.5">
                            <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              Affected: {news.relatedSymbol}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : newsLoading ? (
                    <div className="text-center py-10 text-slate-400 text-xs animate-pulse">
                      Downloading news from Gemini wires...
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No active market news. Switch regimes or simulate to refresh feed.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "investor":
        return (
          <motion.div 
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Active LPs & Allocations */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Users className="text-blue-600" size={18} />
                  Institutional LPs & Capital Commitments
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Manage relationships with elite institutional allocators. Inflows scale depending on your performance Sharpe ratio and career reputation levels.
                </p>

                <div className="space-y-4">
                  {gameState.investors.map(lp => {
                    const isUnlocked = gameState.reputation >= lp.minReputation;
                    return (
                      <div key={lp.id} className={`border rounded-lg p-4 transition-all ${
                        isUnlocked ? "bg-slate-50 border-slate-200" : "bg-slate-100/50 border-slate-100 opacity-60"
                      }`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              {lp.name}
                              {!isUnlocked && <Lock size={12} className="text-slate-400" />}
                            </span>
                            <span className="text-[10px] text-slate-500 block sm:inline sm:ml-2">Minimum Level {lp.minReputation} Required</span>
                          </div>

                          {isUnlocked ? (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400">Inflow Share:</span>
                              <span className="font-mono font-bold text-blue-600">{Math.round(lp.sharePercent * 100)}%</span>
                            </div>
                          ) : (
                            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">
                              Locked
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mb-3">{lp.description}</p>

                        {isUnlocked && (
                          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono border-t border-slate-100 pt-3">
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px] font-sans font-bold">Invested Pool</span>
                              <span className="text-slate-900 font-bold">${lp.totalInvested} Million</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px] font-sans font-bold">LP Confidence</span>
                              <span className="text-blue-600 font-bold">{lp.currentConfidence}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px] font-sans font-bold">Vol Tolerance</span>
                              <span className="text-slate-900 font-bold uppercase">{lp.volatilityTolerance}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inflows & Placement Rules */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Award className="text-blue-600" size={16} />
                  Inflow Attracting Diagnostics
                </h3>

                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>
                    Institutional Limited Partners (LPs) assess the <strong>annualized Sharpe ratio</strong> of your allocations before allocating capital.
                  </p>
                  <p>
                    Maintaining a Sharpe ratio above <strong className="text-slate-900">1.50</strong> acts as a net positive inflow trigger.
                  </p>
                  <p>
                    If your drawdown dips below your LP volatility tolerance limits, redemptions are initiated, decreasing your active AUM.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded text-[11px] mt-2 font-mono">
                    <strong>Capital Strategy:</strong> High Sharpe + Zero Drawdowns = Rocketing AUM.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "war":
        return (
          <motion.div 
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* AI Hedge Fund Competitor Rivals */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Award className="text-blue-600" size={18} />
                  Elite Institutional Competitor Hub
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Identify and compete with global autonomous hedge funds. Out-perform their performance vectors to capture career rank standing and LP capital allocations.
                </p>

                <div className="space-y-4">
                  {gameState.leaderboard.map(fund => {
                    const returnIsPositive = fund.monthlyReturn >= 0;
                    return (
                      <div key={fund.id} className={`border rounded-lg p-4 transition-all ${
                        fund.isPlayer 
                          ? "bg-blue-50 border-blue-300 shadow-sm" 
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">
                              Rank {fund.rank} — {fund.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{fund.style}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-400">Total Capital</span>
                            <span className="font-mono font-bold text-slate-900 block">{formatCurrency(fund.aum)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono border-t border-slate-100 pt-3">
                          <div>
                            <span className="text-slate-400 block uppercase text-[9px] font-sans font-bold">Sharpe Ratio</span>
                            <span className="text-slate-900 font-bold">{fund.sharpeRatio.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[9px] font-sans font-bold">Return (M/M)</span>
                            <span className={`font-bold ${returnIsPositive ? "text-emerald-600" : "text-red-600"}`}>
                              {returnIsPositive ? "+" : ""}{fund.monthlyReturn}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[9px] font-sans font-bold">Fund Asset Edge</span>
                            <span className="text-blue-600 font-bold truncate max-w-[120px] block">{fund.specialAbility}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Campaign Rules & Intel */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Award className="text-blue-600" size={16} />
                  Battlefield Intel
                </h3>

                <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                  <p>
                    Your ultimate goal is to overtake <strong>Nexus AI Core</strong> (Level 1 Rank) to secure total dominance.
                  </p>
                  <p>
                    Outperforming rival funds increases your monthly inflows directly at their expense, shrinking competitor pool metrics.
                  </p>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px]">
                    <span className="font-bold text-slate-800 block mb-1">Rival Boss Abilities:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500">
                      <li><strong>Nexus AI Core</strong>: Dynamic model calibration (adapts instantly).</li>
                      <li><strong>Omega Alpha</strong>: Frontruns public algorithms.</li>
                      <li><strong>Phoenix Macro</strong>: Immunity to macro events.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-x-hidden selection:bg-blue-600/10 selection:text-blue-900">
      
      {/* PROFESSIONAL SLATE BAR HEADER */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            Q
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              Quant Arena: The Algorithmic War
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 font-bold">
                INSTITUTIONAL CORE
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">Autonomous Strategic Finance Game</p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="hidden lg:flex items-center gap-6 text-xs tracking-tight font-mono">
          <div className="bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-slate-400">AUM:</span>
            <span className="text-blue-600 font-bold text-sm">{formatCurrency(gameState.aum)}</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-slate-400">REP LEVEL:</span>
            <span className="text-slate-900 font-bold text-sm">LVL {gameState.reputation} / 100</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-slate-400">TIMELINE:</span>
            <span className="text-slate-900 font-bold text-sm">M{gameState.month} / Y{gameState.year}</span>
          </div>
        </div>

        {/* Dynamic Regime Badge */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded text-amber-800 text-[11px] font-bold tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
            REGIME: {gameState.regime.replace("_", " ")}
          </div>
          <button 
            onClick={handleResetGame}
            title="Reset Game Core"
            className="p-1.5 hover:bg-red-500/10 border border-slate-200 hover:border-red-500/30 rounded text-slate-400 hover:text-red-500 transition-all cursor-pointer bg-white"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE GRID */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* SIDE NAVIGATION PANEL */}
        <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-4 flex flex-col gap-2 shrink-0 relative z-10 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-wider">COMMAND CENTERS</div>
          
          <button 
            onClick={() => setActiveTab("trading")}
            className={`flex items-center justify-between w-full p-2.5 border rounded-lg text-left transition-all cursor-pointer ${
              activeTab === "trading" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-900 bg-slate-50/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders size={15} />
              <span className="text-xs font-bold uppercase tracking-wide">Trading Floor</span>
            </div>
            <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
          </button>

          <button 
            onClick={() => setActiveTab("quant")}
            className={`flex items-center justify-between w-full p-2.5 border rounded-lg text-left transition-all cursor-pointer ${
              activeTab === "quant" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-900 bg-slate-50/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu size={15} />
              <span className="text-xs font-bold uppercase tracking-wide">Quant Lab</span>
            </div>
            {gameState.mlModels.some(m => !m.trained) && (
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("risk")}
            className={`flex items-center justify-between w-full p-2.5 border rounded-lg text-left transition-all cursor-pointer ${
              activeTab === "risk" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-900 bg-slate-50/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={15} />
              <span className="text-xs font-bold uppercase tracking-wide">Risk Command</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("research")}
            className={`flex items-center justify-between w-full p-2.5 border rounded-lg text-left transition-all cursor-pointer ${
              activeTab === "research" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-900 bg-slate-50/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Terminal size={15} />
              <span className="text-xs font-bold uppercase tracking-wide">Research Terminal</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("investor")}
            className={`flex items-center justify-between w-full p-2.5 border rounded-lg text-left transition-all cursor-pointer ${
              activeTab === "investor" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-900 bg-slate-50/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users size={15} />
              <span className="text-xs font-bold uppercase tracking-wide">Investor Relations</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("war")}
            className={`flex items-center justify-between w-full p-2.5 border rounded-lg text-left transition-all cursor-pointer ${
              activeTab === "war" 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-900 bg-slate-50/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award size={15} />
              <span className="text-xs font-bold uppercase tracking-wide">War Room (Rivals)</span>
            </div>
            {gameState.aum >= 1000000 && (
              <span className="text-[8px] bg-red-600 text-white font-bold px-1 rounded animate-pulse">BOSS</span>
            )}
          </button>

          {/* SIDEBAR FOOTER METRICS */}
          <div className="mt-auto border-t border-slate-200 pt-4 hidden md:block">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-2.5 tracking-wider">PORTFOLIO DIAGNOSTICS</div>
            <div className="space-y-2 bg-slate-50 border border-slate-200 p-3 rounded-lg font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">ANN. SHARPE:</span>
                <span className={`font-bold ${
                  (riskData?.metrics?.sharpeRatio || 1.2) >= 1.5 ? "text-emerald-600" : "text-amber-600"
                }`}>{riskData?.metrics?.sharpeRatio || "1.20"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">EST. ALPHA:</span>
                <span className="text-emerald-600 font-bold">+{riskData?.metrics?.alpha || "4.8"}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">MAX DRAWDOWN:</span>
                <span className="text-red-500 font-bold">-{riskData?.metrics?.maxDrawdown || "14.2"}%</span>
              </div>
            </div>
          </div>
        </nav>

        {/* MAIN PANEL CONTENT SPACE */}
        <main className="flex-1 bg-slate-50 p-6 overflow-y-auto relative z-0">
          
          {/* TOP CORE HUD METRIC PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">HEDGE FUND CAPITAL</span>
                <span className="font-mono text-xl font-bold text-slate-900">{formatCurrency(gameState.aum)}</span>
              </div>
              <DollarSign className="text-slate-300" size={24} />
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">CAREER STANDING RANK</span>
                <span className="font-mono text-xl font-bold text-slate-900">RANK #{gameState.leaderboard.find(f => f.isPlayer)?.rank || 6}</span>
              </div>
              <Award className="text-slate-300" size={24} />
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">CAREER REPUTATION</span>
                <span className="font-mono text-xl font-bold text-slate-900">LVL {gameState.reputation} / 100</span>
              </div>
              <Users className="text-slate-300" size={24} />
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">ACTIVE SYSTEM LOGS</span>
                <span className="font-mono text-xs font-bold text-blue-600 block truncate max-w-[160px]">{systemLogs[0]}</span>
              </div>
              <Terminal className="text-slate-300" size={24} />
            </div>
          </div>

          {/* DYNAMIC SCREEN SWITCHING CONTAINER */}
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </main>
      </div>

      {/* SUBMIT MONTH PERFORMANCE OUTCOME MODAL OVERLAY */}
      {showOutcomeModal && lastStateSnapshot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg"
          >
            <div className="text-center mb-5 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <Check size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Turn Simulation Complete</h3>
              <p className="text-xs text-slate-500 font-mono">Month transitioned to M{gameState.month} / Y{gameState.year}</p>
            </div>

            <div className="space-y-3.5 mb-6 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Monthly Return Rate</span>
                <span className={`font-mono font-bold ${
                  (gameState.history[gameState.history.length - 1]?.returnRate || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {(gameState.history[gameState.history.length - 1]?.returnRate || 0) >= 0 ? "+" : ""}
                  {gameState.history[gameState.history.length - 1]?.returnRate}%
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Ending Fund Assets (AUM)</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(gameState.aum)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Investor Fund Inflows</span>
                <span className={`font-mono font-bold ${
                  (gameState.aum - lastStateSnapshot.aum) >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {(gameState.aum - lastStateSnapshot.aum) >= 0 ? "+" : ""}
                  ${(gameState.aum - lastStateSnapshot.aum).toFixed(2)}M
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500">Active Market Regime</span>
                <span className="font-mono font-bold text-slate-900 uppercase">{gameState.regime.replace("_", " ")}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowOutcomeModal(false);
                addSystemLog("Transition outcome closed. Formulating next monthly allocation weights.");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded text-sm transition-colors cursor-pointer"
            >
              Configure Next Month Portfolio Allocations
            </button>
          </motion.div>
        </div>
      )}

      {/* SYSTEM FEEDBACK TICKER */}
      <footer className="h-8 border-t border-slate-200 bg-white flex items-center px-6 text-[10px] shrink-0 font-mono text-slate-400 select-none shadow-inner">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-500 border-r border-slate-200 pr-3 mr-3 font-semibold">
          <Terminal size={12} className="text-blue-500" />
          SYSTEM FEEDBACK LOGS
        </div>
        <div className="truncate flex-1">
          {systemLogs[0] || "Awaiting quant vectors..."}
        </div>
        <div className="shrink-0 text-slate-400 pl-3 border-l border-slate-200 ml-3">
          SYSTEM CLOCK: {new Date().toLocaleDateString()}
        </div>
      </footer>
    </div>
  );
}
