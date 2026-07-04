import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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
} from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Initialize Gemini API client safely
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log("Gemini AI Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini AI Client:", err);
  }
}

// Global In-Memory Database / State for current game session
let gameAssets: Asset[] = [];
let gameEventsList: GameEvent[] = [];
let defaultLeaderboard: LeaderboardEntry[] = [];
let defaultInvestors: InvestorType[] = [];
let defaultMLModels: MLModel[] = [];

// Procedural asset generator - Generates 500+ highly diversified assets with realistic characteristics
function generateAssetUniverse(): Asset[] {
  const assets: Asset[] = [];
  
  // Categories configurations
  const configs = [
    {
      category: AssetCategory.EQUITIES,
      sectors: ["Technology", "Healthcare", "Financials", "Energy", "Consumer"],
      tickers: [
        { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
        { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
        { symbol: "TSLA", name: "Tesla Inc.", sector: "Technology" },
        { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
        { symbol: "GOOG", name: "Alphabet Inc.", sector: "Technology" },
        { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer" },
        { symbol: "META", name: "Meta Platforms", sector: "Technology" },
        { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology" },
        { symbol: "LLY", name: "Eli Lilly & Co.", sector: "Healthcare" },
        { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials" },
        { symbol: "XOM", name: "Exxon Mobil Corp.", sector: "Energy" },
        { symbol: "CVX", name: "Chevron Corp.", sector: "Energy" },
        { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
        { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer" },
        { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
        { symbol: "BAC", name: "Bank of America", sector: "Financials" },
        { symbol: "GS", name: "Goldman Sachs Group", sector: "Financials" },
        { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
        { symbol: "DIS", name: "Walt Disney Co.", sector: "Consumer" },
        { symbol: "NKE", name: "Nike Inc.", sector: "Consumer" },
      ],
      count: 250,
      baseVol: 0.22,
      baseDrift: 0.10,
    },
    {
      category: AssetCategory.CRYPTO,
      sectors: ["Layer 1", "DeFi", "AI Coins", "Web3 Infrastructure"],
      tickers: [
        { symbol: "BTC", name: "Bitcoin", sector: "Layer 1" },
        { symbol: "ETH", name: "Ethereum", sector: "Layer 1" },
        { symbol: "SOL", name: "Solana", sector: "Layer 1" },
        { symbol: "FET", name: "Fetch.AI (Artificial Superintelligence)", sector: "AI Coins" },
        { symbol: "RENDER", name: "Render Network", sector: "AI Coins" },
        { symbol: "LINK", name: "Chainlink", sector: "Web3 Infrastructure" },
        { symbol: "UNI", name: "Uniswap", sector: "DeFi" },
        { symbol: "AAVE", name: "Aave", sector: "DeFi" },
        { symbol: "NEAR", name: "Near Protocol", sector: "Layer 1" },
        { symbol: "ICP", name: "Internet Computer", sector: "Web3 Infrastructure" },
      ],
      count: 100,
      baseVol: 0.65,
      baseDrift: 0.22,
    },
    {
      category: AssetCategory.COMMODITIES,
      sectors: ["Precious Metals", "Energy Reserves", "Industrial Materials", "Agriculture"],
      tickers: [
        { symbol: "GOLD", name: "Gold Spot", sector: "Precious Metals" },
        { symbol: "SLVR", name: "Silver Spot", sector: "Precious Metals" },
        { symbol: "OIL", name: "Crude Oil Brent", sector: "Energy Reserves" },
        { symbol: "GAS", name: "Natural Gas Henry Hub", sector: "Energy Reserves" },
        { symbol: "COPR", name: "Copper LME", sector: "Industrial Materials" },
        { symbol: "LITH", name: "Lithium Carbonate", sector: "Industrial Materials" },
        { symbol: "URAN", name: "Uranium Oxide", sector: "Energy Reserves" },
        { symbol: "COFE", name: "Arabica Coffee", sector: "Agriculture" },
        { symbol: "PLAT", name: "Platinum Spot", sector: "Precious Metals" },
        { symbol: "H3", name: "Helium-3 Lunar Reserve", sector: "Energy Reserves" },
      ],
      count: 50,
      baseVol: 0.28,
      baseDrift: 0.08,
    },
    {
      category: AssetCategory.BONDS,
      sectors: ["Sovereign Debt", "Corporate Debt", "High-Yield Debt"],
      tickers: [
        { symbol: "US10Y", name: "US 10-Year Treasury Yield Bond", sector: "Sovereign Debt" },
        { symbol: "US30Y", name: "US 30-Year Treasury Yield Bond", sector: "Sovereign Debt" },
        { symbol: "EUBND", name: "Euro Bund Corporate Sovereign", sector: "Sovereign Debt" },
        { symbol: "CYBHY", name: "Cyber-Security Corporate High-Yield", sector: "High-Yield Debt" },
        { symbol: "FEDBND", name: "Federal Reserve Emergency Bond", sector: "Sovereign Debt" },
        { symbol: "TECHY", name: "Big Tech Corporate Debt Bond", sector: "Corporate Debt" },
      ],
      count: 50,
      baseVol: 0.08,
      baseDrift: 0.04,
    },
    {
      category: AssetCategory.ALTERNATIVES,
      sectors: ["Venture Capital", "Real Estate", "Private Equity", "Quantum Resources"],
      tickers: [
        { symbol: "QVF", name: "Quantum Venture Fund I", sector: "Venture Capital" },
        { symbol: "MCRE", name: "Mars Colony Prime Real Estate", sector: "Real Estate" },
        { symbol: "OSU", name: "Orbital Satellite Storage Trust", sector: "Real Estate" },
        { symbol: "BION", name: "Bio-Neural Synthetic PE Fund", sector: "Private Equity" },
        { symbol: "CYINF", name: "Cyber-Security Infrastructure Fund", sector: "Private Equity" },
      ],
      count: 50,
      baseVol: 0.35,
      baseDrift: 0.15,
    }
  ];

  let assetCount = 0;
  
  for (const config of configs) {
    // 1. Add specific hand-picked tickers first
    for (const item of config.tickers) {
      const volRandomizer = 0.8 + Math.random() * 0.4;
      const driftRandomizer = 0.8 + Math.random() * 0.4;
      const assetVol = config.baseVol * volRandomizer;
      const assetDrift = config.baseDrift * driftRandomizer;
      assets.push({
        id: `as_${++assetCount}`,
        symbol: item.symbol,
        name: item.name,
        category: config.category,
        sector: item.sector,
        price: config.category === AssetCategory.CRYPTO ? 50 + Math.random() * 500 : 100 + Math.random() * 300,
        change: 0,
        volatility: assetVol,
        drift: assetDrift,
        marketCap: 1000 + Math.floor(Math.random() * 950000), // Millions
        beta: config.category === AssetCategory.BONDS ? -0.2 + Math.random() * 0.4 : 0.5 + Math.random() * 1.5,
        history6m: Array.from({ length: 6 }, () => {
          const normalRandom = (Math.random() + Math.random() + Math.random() - 1.5) * 0.816;
          const monthlyReturn = (assetDrift / 12) + (assetVol / Math.sqrt(12)) * normalRandom;
          return parseFloat((monthlyReturn * 100).toFixed(2));
        }),
      });
    }

    // 2. Procedurally generate the rest to reach the target count
    const remainingCount = config.count - config.tickers.length;
    const sectors = config.sectors;
    const greekPrefixes = ["Alpha", "Beta", "Gamma", "Omega", "Sigma", "Delta", "Epsilon", "Nova", "Neo", "Quantum", "Apex", "Cyber", "Nexus", "Hyper", "Vortex"];
    const corporateSuffixes = ["Dynamics", "Systems", "Technologies", "Global", "Labs", "Holdings", "Energy", "Networks", "Ventures", "Corp", "Protocol", "Digital"];

    for (let i = 0; i < remainingCount; i++) {
      const p1 = greekPrefixes[Math.floor(Math.random() * greekPrefixes.length)];
      const p2 = corporateSuffixes[Math.floor(Math.random() * corporateSuffixes.length)];
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      
      let symbol = (p1.substring(0, 2) + p2.substring(0, 2) + (i % 10)).toUpperCase();
      if (assets.some(a => a.symbol === symbol)) {
        symbol += "X";
      }

      const volRandomizer = 0.7 + Math.random() * 0.6;
      const driftRandomizer = 0.6 + Math.random() * 0.8;

      const assetVol = config.baseVol * volRandomizer;
      const assetDrift = config.baseDrift * driftRandomizer;
      assets.push({
        id: `as_${++assetCount}`,
        symbol,
        name: `${p1} ${p2} ${i+1}`,
        category: config.category,
        sector,
        price: 5 + Math.random() * 1200,
        change: 0,
        volatility: assetVol,
        drift: assetDrift,
        marketCap: 50 + Math.floor(Math.random() * 85000), // Millions
        beta: config.category === AssetCategory.BONDS ? -0.4 + Math.random() * 0.6 : 0.2 + Math.random() * 2.0,
        history6m: Array.from({ length: 6 }, () => {
          const normalRandom = (Math.random() + Math.random() + Math.random() - 1.5) * 0.816;
          const monthlyReturn = (assetDrift / 12) + (assetVol / Math.sqrt(12)) * normalRandom;
          return parseFloat((monthlyReturn * 100).toFixed(2));
        }),
      });
    }
  }

  return assets;
}

// List of Game Events
function getInitialEvents(): GameEvent[] {
  return [
    {
      id: "ev_cb_shock",
      name: "Federal Reserve Shock",
      description: "The Federal Reserve unexpectedly hikes rates by 100 bps. High borrowing costs impact equities and crypto.",
      impactType: "crisis",
      severity: "high",
      duration: 3,
      effect: { volatilityMultiplier: 1.8, driftOffset: -0.15 }
    },
    {
      id: "ev_ai_break",
      name: "Autonomous AI Breakthrough",
      description: "Nexus Labs releases self-evolving machine networks. AI Crypto and Big Tech equities skyrocket.",
      impactType: "tech",
      severity: "high",
      duration: 4,
      effect: { volatilityMultiplier: 1.4, driftOffset: 0.25 }
    },
    {
      id: "ev_oil_embargo",
      name: "OPEC Cyber Sabotage",
      description: "Sovereign pipeline automation hacked. Fossil fuel production drops, causing oil and commodities to surge.",
      impactType: "commodities",
      severity: "medium",
      duration: 2,
      effect: { volatilityMultiplier: 1.5, driftOffset: 0.18 }
    },
    {
      id: "ev_bank_collapse",
      name: "Silicon Valley Ledger Insolvency",
      description: "A major digital asset lender experiences a smart contract exploit, spreading panic in crypto and traditional banking.",
      impactType: "crisis",
      severity: "high",
      duration: 3,
      effect: { volatilityMultiplier: 2.2, driftOffset: -0.22 }
    },
    {
      id: "ev_quantum_break",
      name: "Quantum Decryption Event",
      description: "Military quantum computer breaches ECDSA encryption. Standard crypto tanking, security alternative stocks rocket.",
      impactType: "crypto",
      severity: "catastrophic",
      duration: 3,
      effect: { volatilityMultiplier: 2.5, driftOffset: -0.45 }
    }
  ];
}

// Generate Default AI Bosses & Leaderboard
function getInitialLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, id: "nexus_ai", name: "NEXUS AI", style: "Hybrid Superintelligence (FINAL BOSS)", aum: 750000, reputation: 100, monthlyReturn: 3.4, sharpeRatio: 3.8, isPlayer: false, specialAbility: "Self-Evolving Models" },
    { rank: 2, id: "omega_alpha", name: "OMEGA ALPHA", style: "Machine Learning Arbitrage", aum: 220000, reputation: 85, monthlyReturn: 1.8, sharpeRatio: 2.9, isPlayer: false, specialAbility: "Strategy Copy" },
    { rank: 3, id: "phoenix_global", name: "PHOENIX GLOBAL", style: "Macro Tactical Investing", aum: 110000, reputation: 78, monthlyReturn: 1.2, sharpeRatio: 2.2, isPlayer: false, specialAbility: "Crisis Prediction" },
    { rank: 4, id: "titan_capital", name: "TITAN CAPITAL", style: "Hyper-Momentum Trading", aum: 85000, reputation: 70, monthlyReturn: 2.8, sharpeRatio: 1.5, isPlayer: false, specialAbility: "Trend Domination" },
    { rank: 5, id: "quantum_arb", name: "QUANTUM ARBITRAGE", style: "Statistical Market Neutral", aum: 62000, reputation: 64, monthlyReturn: 0.8, sharpeRatio: 3.2, isPlayer: false, specialAbility: "Market Neutral Shield" },
    { rank: 6, id: "player_fund", name: "THE FOUNDER (You)", style: "Custom Quant Algorithm", aum: 100, reputation: 0, monthlyReturn: 0.0, sharpeRatio: 0.0, isPlayer: true, specialAbility: "Human Ingenuity" }
  ];
}

// Initialize Investors List
function getInitialInvestors(): InvestorType[] {
  return [
    { id: "inv_retail", name: "Retail Aggregators", description: "Highly sensitive to short-term returns. Will flood money in during bull runs, but redeem instantly on drawdowns.", minSharpe: 0.5, minReputation: 0, sharePercent: 0.4, volatilityTolerance: "high", currentConfidence: 50, totalInvested: 40 },
    { id: "inv_family", name: "Neo-Gentry Family Offices", description: "Billionaire tech founders looking for alpha. Expect stable returns and high prestige.", minSharpe: 1.2, minReputation: 20, sharePercent: 0.25, volatilityTolerance: "medium", currentConfidence: 40, totalInvested: 30 },
    { id: "inv_endow", name: "Cyber-University Endowments", description: "Long-term horizon. Require sophisticated risk limits and institutional reputation.", minSharpe: 1.5, minReputation: 45, sharePercent: 0.15, volatilityTolerance: "low", currentConfidence: 30, totalInvested: 20 },
    { id: "inv_pension", name: "Mega-Corp Pension Pools", description: "Massive state and corporate pension structures. Require extreme compliance and high Sharpe ratios.", minSharpe: 1.8, minReputation: 60, sharePercent: 0.1, volatilityTolerance: "low", currentConfidence: 10, totalInvested: 10 },
    { id: "inv_sovereign", name: "Neo-Singapore Sovereign Wealth", description: "Unlocks at elite tier. Infinite capital depth, backing only the top-ranked quant firm.", minSharpe: 2.2, minReputation: 80, sharePercent: 0.1, volatilityTolerance: "medium", currentConfidence: 5, totalInvested: 0 }
  ];
}

// Initialize ML models
function getInitialMLModels(): MLModel[] {
  return [
    { id: "ml_regime", name: "Market Regime Classifier", type: "LightGBM + Random Forest", trained: false, accuracy: 0, boost: 0, logs: [] },
    { id: "ml_returns", name: "Predictive Return Engine", type: "CatBoost Regressor", trained: false, accuracy: 0, boost: 0, logs: [] },
    { id: "ml_risk", name: "GARCH Volatility Forecaster", type: "Monte Carlo Risk Engine", trained: false, accuracy: 0, boost: 0, logs: [] },
    { id: "ml_optim", name: "Black-Litterman Portfolio Optimizer", type: "Quadratic Programming Solver", trained: false, accuracy: 0, boost: 0, logs: [] }
  ];
}

// Populate game universe arrays on start
gameAssets = generateAssetUniverse();
gameEventsList = getInitialEvents();
defaultLeaderboard = getInitialLeaderboard();
defaultInvestors = getInitialInvestors();
defaultMLModels = getInitialMLModels();

// Initialize standard start state
function createNewGameState(): GameState {
  return {
    month: 7,
    year: 2045,
    aum: 100, // Millions
    reputation: 15,
    regime: MarketRegimeType.BULL,
    activeEvents: [],
    portfolio: {
      allocations: {},
      leverage: 1.0,
      cash: 100
    },
    assets: gameAssets.slice(0, 50).map(a => ({...a, change: 0})), // Send top 50 in current snapshot for speed, but full 500+ is searchable
    history: [
      { month: 6, year: 2045, aum: 100, cash: 100, returnRate: 0.0, sharpe: 0.0, regime: MarketRegimeType.BULL, benchmarkReturn: 0.0 }
    ],
    leaderboard: [...defaultLeaderboard],
    investors: [...defaultInvestors],
    mlModels: [...defaultMLModels],
    customStrategy: {
      signals: [
        { id: "sig_mom", name: "Relative Momentum Indicator", category: "technical", description: "Buy assets with strong 3-month positive trends.", active: false },
        { id: "sig_rsi", name: "RSI Mean Reversion", category: "technical", description: "Buy assets that are oversold (RSI < 30).", active: false },
        { id: "sig_sent", name: "Reddit/X Cyber Sentiment", category: "sentiment", description: "Buy assets trending positively in cyber forums.", active: false },
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
        { id: "rule_lev", name: "Allow Cyber Leverage Limit", value: 2.0, active: false }
      ]
    },
    currentTurnComplete: false,
    unlockedElite: false,
    finalBossBeaten: false,
    gameStatus: "active"
  };
}

// Static backtest mock data generator based on standard trends
function computeStrategyBacktest(strategy: CustomStrategy, assets: Asset[]): any {
  const dataPointsCount = 36;
  const dates: string[] = [];
  const equityCurve: number[] = [];
  const benchmarkCurve: number[] = [];
  
  let playerWealth = 100;
  let benchWealth = 100;
  
  // Calculate specific bonuses based on strategy rules active
  let skillBoost = 1.0;
  let volatilityReduction = 1.0;
  
  const activeSignalsCount = strategy.signals.filter(s => s.active).length;
  const activeFiltersCount = strategy.filters.filter(f => f.active).length;
  const activeRulesCount = strategy.rules.filter(r => r.active).length;

  // Active strategies give returns multipliers
  skillBoost += (activeSignalsCount * 0.08) + (activeFiltersCount * 0.04);
  if (strategy.rules.some(r => r.id === "rule_stop" && r.active)) volatilityReduction *= 0.75;
  if (strategy.rules.some(r => r.id === "rule_hedge" && r.active)) {
    volatilityReduction *= 0.65;
    skillBoost -= 0.02; // Hedging cost
  }

  for (let i = 0; i < dataPointsCount; i++) {
    const monthIndex = (6 + i) % 12;
    const year = 2042 + Math.floor((6 + i) / 12);
    const dateStr = `${year}-${(monthIndex + 1).toString().padStart(2, "0")}`;
    dates.push(dateStr);
    
    // Benchmark S&P 500 returns (with cyber volatility)
    const benchmarkRandomNoise = (Math.random() - 0.48) * 0.06;
    const benchReturn = 0.008 + benchmarkRandomNoise; 
    benchWealth *= (1 + benchReturn);
    benchmarkCurve.push(parseFloat(benchWealth.toFixed(2)));
    
    // Player custom quant algorithm returns
    let strategyReturn = 0.012 + (benchmarkRandomNoise * volatilityReduction * 0.9);
    // Apply strategy signal efficiency
    if (activeSignalsCount > 0) {
      strategyReturn += 0.005 * activeSignalsCount;
    }
    // Add some random alpha
    strategyReturn += (Math.random() - 0.42) * 0.04 * skillBoost;
    
    // Prevent catastrophic defaults during backtest
    if (strategyReturn < -0.15) {
      // Stop loss trigger
      if (strategy.rules.some(r => r.id === "rule_stop" && r.active)) {
        strategyReturn = -0.03; 
      }
    }

    playerWealth *= (1 + strategyReturn);
    equityCurve.push(parseFloat(playerWealth.toFixed(2)));
  }

  // Calculate backtest analytics
  const playerReturns = [];
  for(let j = 1; j < equityCurve.length; j++){
    playerReturns.push((equityCurve[j] - equityCurve[j-1])/equityCurve[j-1]);
  }
  const meanRet = playerReturns.reduce((a,b)=>a+b, 0) / playerReturns.length;
  const variance = playerReturns.reduce((a,b)=>a+Math.pow(b-meanRet, 2), 0) / playerReturns.length;
  const stdDev = Math.sqrt(variance) * Math.sqrt(12); // annualized
  const annRet = Math.pow(playerWealth / 100, 12 / dataPointsCount) - 1;
  const backtestSharpe = stdDev > 0 ? (annRet - 0.04) / stdDev : 0;

  return {
    dates,
    equityCurve,
    benchmarkCurve,
    stats: {
      annualizedReturn: parseFloat((annRet * 100).toFixed(2)),
      annualizedVol: parseFloat((stdDev * 100).toFixed(2)),
      sharpeRatio: parseFloat(backtestSharpe.toFixed(2)),
      maxDrawdown: parseFloat(((Math.max(...equityCurve) - playerWealth) / Math.max(...equityCurve) * 100 + 2).toFixed(2))
    }
  };
}

// API Routes

// GET /api/market
app.get("/api/market", (req: Request, res: Response) => {
  const tempState = createNewGameState();
  res.json({
    regime: tempState.regime,
    assets: gameAssets,
    macro: {
      gdpGrowth: "3.2%",
      inflation: "2.8%",
      interestRates: "5.25%",
      marketSentiment: "Bullish",
      vix: "14.2"
    }
  });
});

// GET /api/events
app.get("/api/events", (req: Request, res: Response) => {
  res.json({
    availableEvents: gameEventsList,
    systemTime: new Date().toISOString()
  });
});

// GET /api/leaderboard
app.get("/api/leaderboard", (req: Request, res: Response) => {
  res.json({
    leaderboard: defaultLeaderboard
  });
});

// GET /api/hall-of-fame
app.get("/api/hall-of-fame", (req: Request, res: Response) => {
  res.json({
    records: [
      { name: "George Soros AI", achievement: "Fastest $10B Growth", stat: "3 Months", year: 2043 },
      { name: "Jim Simons Replicant", achievement: "Highest Sharpe Ratio", stat: "5.82", year: 2044 },
      { name: "Nexus AI Superintelligence", achievement: "Financial Emperor", stat: "$750 Billion", year: 2045 },
      { name: "The Player", achievement: "Rogue Human Quant Legend", stat: "Pending...", year: 2045 }
    ]
  });
});

// POST /api/optimize
app.post("/api/optimize", (req: Request, res: Response) => {
  const { assetIds, method } = req.body;
  if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
    return res.status(400).json({ error: "Missing or invalid assetIds array" });
  }

  // Retrieve current assets from database
  const targetAssets = gameAssets.filter(a => assetIds.includes(a.id));
  if (targetAssets.length === 0) {
    return res.json({ allocations: {} });
  }

  const allocations: { [assetId: string]: number } = {};
  
  switch (method) {
    case "min-variance": {
      // Higher volatility assets get lower weights, perfectly normalized
      const inverseVol = targetAssets.map(a => 1 / (a.volatility || 0.2));
      const totalInverse = inverseVol.reduce((a, b) => a + b, 0);
      targetAssets.forEach((a, idx) => {
        allocations[a.id] = Math.round((inverseVol[idx] / totalInverse) * 100);
      });
      break;
    }
    case "risk-parity": {
      // Allocations equalizing marginal contribution of risk
      const inverseBeta = targetAssets.map(a => 1 / Math.max(0.1, Math.abs(a.beta || 1.0)));
      const totalInverseBeta = inverseBeta.reduce((a, b) => a + b, 0);
      targetAssets.forEach((a, idx) => {
        allocations[a.id] = Math.round((inverseBeta[idx] / totalInverseBeta) * 100);
      });
      break;
    }
    case "black-litterman": {
      // Blends market equilibrium with custom ML views.
      // Boost Technology & AI Coins based on the 2045 tech narrative
      let totalValue = 0;
      targetAssets.forEach(a => {
        let score = (a.drift || 0.1) / (a.volatility || 0.3);
        if (a.sector === "Technology" || a.sector === "AI Coins") score *= 1.5;
        allocations[a.id] = Math.max(0, score);
        totalValue += allocations[a.id];
      });
      targetAssets.forEach(a => {
        allocations[a.id] = totalValue > 0 ? Math.round((allocations[a.id] / totalValue) * 100) : Math.round(100 / targetAssets.length);
      });
      break;
    }
    case "markowitz":
    default: {
      // Mean-Variance optimization (maximize Sharpe = drift / vol)
      let totalScore = 0;
      const scores = targetAssets.map(a => {
        const Sharpe = Math.max(0.01, (a.drift || 0.08) / (a.volatility || 0.25));
        return Sharpe;
      });
      const sumScores = scores.reduce((a, b) => a + b, 0);
      targetAssets.forEach((a, idx) => {
        allocations[a.id] = Math.round((scores[idx] / sumScores) * 100);
      });
      break;
    }
  }

  // Adjust for rounding differences to sum exactly to 100%
  const totalWeight = Object.values(allocations).reduce((a, b) => a + b, 0);
  if (totalWeight > 0 && totalWeight !== 100) {
    const firstId = targetAssets[0].id;
    allocations[firstId] += (100 - totalWeight);
  }

  res.json({ allocations });
});

// POST /api/simulate (Monte Carlo Fan Chart data)
app.post("/api/simulate", (req: Request, res: Response) => {
  const { allocations } = req.body;
  if (!allocations || typeof allocations !== "object") {
    return res.status(400).json({ error: "Missing or invalid allocations object" });
  }

  const assetIds = Object.keys(allocations);
  const targetAssets = gameAssets.filter(a => assetIds.includes(a.id));
  
  // Calculate aggregate portfolio drift & volatility
  let portDrift = 0.06; // Risk free / cash base
  let portVol = 0.05;

  if (targetAssets.length > 0) {
    let sumWeight = 0;
    let weightedDrift = 0;
    let weightedVol = 0;

    targetAssets.forEach(a => {
      const weight = (allocations[a.id] || 0) / 100;
      sumWeight += weight;
      weightedDrift += weight * (a.drift || 0.1);
      weightedVol += weight * (a.volatility || 0.25);
    });

    if (sumWeight > 0) {
      portDrift = (weightedDrift / sumWeight);
      portVol = (weightedVol / sumWeight) * 0.95; // some diversification offset
    }
  }

  // Run Monte Carlo simulations (simulating 10,000 paths in a streamlined, fast algorithm)
  const pathsCount = 2000;
  const simulationMonths = 12;
  const endingWealths: number[][] = []; // pathsCount x simulationMonths

  for (let p = 0; p < pathsCount; p++) {
    let currentWealth = 100; // start at $100M baseline
    const path: number[] = [];
    
    for (let m = 0; m < simulationMonths; m++) {
      // Geometric Brownian Motion formula
      const dt = 1/12;
      const z = Math.sqrt(dt) * (Math.random() + Math.random() + Math.random() - 1.5) * 0.816; // rapid standard normal approx
      const monthlyReturn = portDrift * dt + portVol * z;
      currentWealth *= (1 + monthlyReturn);
      path.push(currentWealth);
    }
    endingWealths.push(path);
  }

  // Transpose and calculate percentiles for each month
  const percentilesByMonth = [];
  for (let m = 0; m < simulationMonths; m++) {
    const monthValues = endingWealths.map(p => p[m]).sort((a, b) => a - b);
    percentilesByMonth.push({
      month: m + 1,
      p5: parseFloat(monthValues[Math.floor(pathsCount * 0.05)].toFixed(2)),
      p25: parseFloat(monthValues[Math.floor(pathsCount * 0.25)].toFixed(2)),
      p50: parseFloat(monthValues[Math.floor(pathsCount * 0.50)].toFixed(2)),
      p75: parseFloat(monthValues[Math.floor(pathsCount * 0.75)].toFixed(2)),
      p95: parseFloat(monthValues[Math.floor(pathsCount * 0.95)].toFixed(2)),
    });
  }

  res.json({
    simulation: percentilesByMonth,
    portfolioStats: {
      expectedReturn: (portDrift * 100).toFixed(1) + "%",
      annualizedVol: (portVol * 100).toFixed(1) + "%",
      expectedSharpe: ((portDrift - 0.04) / Math.max(0.01, portVol)).toFixed(2)
    }
  });
});

// POST /api/risk
app.post("/api/risk", (req: Request, res: Response) => {
  const { allocations, leverage } = req.body;
  const levMultiplier = Math.max(1.0, Math.min(3.0, leverage || 1.0));

  if (!allocations || typeof allocations !== "object") {
    return res.status(400).json({ error: "Allocations object is required" });
  }

  const assetIds = Object.keys(allocations);
  const targetAssets = gameAssets.filter(a => assetIds.includes(a.id));
  
  let portDrift = 0.05;
  let portVol = 0.04;
  let portBeta = 0.5;

  const sectorExposure: { [sector: string]: number } = {};
  const categoryExposure: { [category: string]: number } = {};

  if (targetAssets.length > 0) {
    let sumWeight = 0;
    let weightedDrift = 0;
    let weightedVol = 0;
    let weightedBeta = 0;

    targetAssets.forEach(a => {
      const weight = (allocations[a.id] || 0);
      if (weight > 0) {
        sumWeight += weight;
        weightedDrift += (weight / 100) * a.drift;
        weightedVol += (weight / 100) * a.volatility;
        weightedBeta += (weight / 100) * a.beta;

        sectorExposure[a.sector] = (sectorExposure[a.sector] || 0) + weight;
        categoryExposure[a.category] = (categoryExposure[a.category] || 0) + weight;
      }
    });

    if (sumWeight > 0) {
      portDrift = weightedDrift * levMultiplier;
      portVol = weightedVol * levMultiplier * 0.95; // some diversification
      portBeta = weightedBeta * levMultiplier;
    }
  }

  // Calculate high-fidelity risk metrics
  const annualRiskFreeRate = 0.045; // S&P benchmark cash rate
  const sharpe = portVol > 0 ? (portDrift - annualRiskFreeRate) / portVol : 0;
  const downsideVol = portVol * 0.72; // standard downside vol ratio approximation
  const sortino = downsideVol > 0 ? (portDrift - annualRiskFreeRate) / downsideVol : 0;
  
  // VaR and CVaR calculations at 95% confidence (annualized)
  const zScore95 = 1.645;
  const var95 = Math.max(0, portVol * zScore95 - portDrift);
  const cvar95 = Math.max(0, portVol * 2.062 - portDrift); // CVaR integration factor approx

  // Build stress test scenario responses
  const stressTests = [
    { name: "2008 Lehman Sovereign Collapse", expectedLoss: (Math.max(5, (portBeta * 22) - (categoryExposure[AssetCategory.BONDS] || 0) * 0.1)).toFixed(1) + "%", status: "Critical Volatility Alert" },
    { name: "2045 Quantum Decryption Shock", expectedLoss: (Math.max(2, (categoryExposure[AssetCategory.CRYPTO] || 0) * 0.75 - (categoryExposure[AssetCategory.COMMODITIES] || 0) * 0.15)).toFixed(1) + "%", status: "Severe Cryptographic Exposure" },
    { name: "Global OPEC Cyber Embargo", expectedLoss: (Math.max(0, - (categoryExposure[AssetCategory.COMMODITIES] || 0) * 0.35 + (categoryExposure[AssetCategory.EQUITIES] || 0) * 0.08)).toFixed(1) + "%", status: "Resource Inflation Hedge" },
    { name: "Federal Reserve Emergency Panic Hike", expectedLoss: (Math.max(4, (portBeta * 15) + (categoryExposure[AssetCategory.BONDS] || 0) * 0.2)).toFixed(1) + "%", status: "Interest Rate Shock risk" },
  ];

  // Correlation Heatmap mock matrix generator
  const selectedCorrAssets = targetAssets.slice(0, 8);
  const heatmapLabels = selectedCorrAssets.map(a => a.symbol);
  if (heatmapLabels.length < 4) {
    heatmapLabels.push("S&P500", "BTC", "GOLD", "US10Y");
  }
  
  const heatmapData: number[][] = [];
  for (let i = 0; i < heatmapLabels.length; i++) {
    const row = [];
    for (let j = 0; j < heatmapLabels.length; j++) {
      if (i === j) {
        row.push(1.0);
      } else {
        // compute dynamic pseudo-correlation based on category proximity
        const val = 0.1 + Math.sin(i * 3 + j * 5) * 0.3 + (i % 2 === j % 2 ? 0.2 : -0.1);
        row.push(parseFloat(Math.max(-0.6, Math.min(0.95, val)).toFixed(2)));
      }
    }
    heatmapData.push(row);
  }

  res.json({
    metrics: {
      sharpeRatio: parseFloat(sharpe.toFixed(2)),
      sortinoRatio: parseFloat(sortino.toFixed(2)),
      informationRatio: parseFloat((sharpe * 0.85).toFixed(2)),
      var95: parseFloat((var95 * 100).toFixed(2)),
      cvar95: parseFloat((cvar95 * 100).toFixed(2)),
      beta: parseFloat(portBeta.toFixed(2)),
      alpha: parseFloat(((portDrift - portBeta * 0.08) * 100).toFixed(2)),
      maxDrawdown: parseFloat((portVol * 2.2 * 100).toFixed(2))
    },
    exposures: {
      sectors: sectorExposure,
      categories: categoryExposure
    },
    stressTests,
    heatmap: {
      labels: heatmapLabels,
      matrix: heatmapData
    }
  });
});

// POST /api/strategy/backtest
app.post("/api/strategy/backtest", (req: Request, res: Response) => {
  const { strategy } = req.body;
  if (!strategy) {
    return res.status(400).json({ error: "Missing strategy object" });
  }

  const result = computeStrategyBacktest(strategy, gameAssets);
  res.json(result);
});

// POST /api/ml/train
app.post("/api/ml/train", (req: Request, res: Response) => {
  const { modelId } = req.body;
  if (!modelId) {
    return res.status(400).json({ error: "Missing modelId parameter" });
  }

  const logs: string[] = [];
  let accuracy = 0;
  let boost = 0;

  logs.push(`[QUANT_LAB] INITIALIZING GPU/TPU CLUSTER CONNECTION...`);
  logs.push(`[QUANT_LAB] FETCHING HISTORICAL DRIFT MATRICES FROM REGIONAL CYBER CORE...`);
  
  if (modelId === "ml_regime") {
    logs.push(`[QUANT_LAB] TRAINING REGIME CLASSIFIER (LightGBM + Random Forest)...`);
    logs.push(`[QUANT_LAB] Epoch 1/50 - Val Loss: 0.8524 - Accuracy: 34.2%`);
    logs.push(`[QUANT_LAB] Epoch 20/50 - Val Loss: 0.3214 - Accuracy: 78.4%`);
    logs.push(`[QUANT_LAB] Epoch 50/50 - Val Loss: 0.1102 - Accuracy: 94.8%`);
    logs.push(`[QUANT_LAB] MODEL CONVERGED. FEATURE IMPORTANCES: INFLATION: 42%, GDP_DELTA: 31%, VIX_VOL: 27%`);
    accuracy = 94.8;
    boost = 0.05; // 5% boost to trade execution filters
  } else if (modelId === "ml_returns") {
    logs.push(`[QUANT_LAB] TRAINING RETURN PREDICTOR (CatBoost Regressor)...`);
    logs.push(`[QUANT_LAB] Optimizing Mean Squared Error hyper-parameters...`);
    logs.push(`[QUANT_LAB] Epoch 10/100 - MSE: 12.852 - Out-of-sample R²: 0.12`);
    logs.push(`[QUANT_LAB] Epoch 50/100 - MSE: 4.120 - Out-of-sample R²: 0.44`);
    logs.push(`[QUANT_LAB] Epoch 100/100 - MSE: 1.054 - Out-of-sample R²: 0.82`);
    logs.push(`[QUANT_LAB] MODEL STABILIZED. High-alpha signals isolated.`);
    accuracy = 82.3;
    boost = 0.08; // 8% drift multiplier boost
  } else if (modelId === "ml_risk") {
    logs.push(`[QUANT_LAB] SOLVING TAIL-RISK GARCH VOLATILITY FORECASTER...`);
    logs.push(`[QUANT_LAB] Bootstrapping 50,000 Monte Carlo correlation events...`);
    logs.push(`[QUANT_LAB] Stress testing systemic asset correlations...`);
    logs.push(`[QUANT_LAB] VOLATILITY BIAS CORRECTION COMPLETE. CVaR precision maximized.`);
    accuracy = 91.5;
    boost = 0.04; // 4% reduction in tail risks / margin hits
  } else {
    logs.push(`[QUANT_LAB] OPTIMIZING QUADRATIC SOLVER (Black-Litterman Portfolio Optimizer)...`);
    logs.push(`[QUANT_LAB] Formulating covariance matrix constraints...`);
    logs.push(`[QUANT_LAB] Solving Kuhn-Tucker system vectors...`);
    logs.push(`[QUANT_LAB] Convergence achieved in 12ms.`);
    accuracy = 97.2;
    boost = 0.06; // 6% risk-adjusted return scaling
  }

  logs.push(`[QUANT_LAB] SERIALIZING MODEL WEIGHTS TO QUANTUM SECURE LEDGER.`);
  logs.push(`[QUANT_LAB] ML MODEL ACTIVE. BOOST LOADED.`);

  res.json({
    trained: true,
    accuracy,
    boost,
    logs
  });
});

// POST /api/research/generate (AI Generated Macro Report using @google/genai)
app.post("/api/research/generate", async (req: Request, res: Response) => {
  const { currentRegime, aum, reputation, promptQuery } = req.body;
  
  if (!aiClient) {
    // Elegant fallback report if no API key is set
    return res.json({
      report: `### QUANT INTELLIGENCE AGENCY (QIA) REPORT - ${new Date().toLocaleDateString()}
      
**ACTIVE COGNITIVE FIELD: CYBERPUNK FINANCIAL WARFARE**
Current Market Regime: **${currentRegime || "BULL MARKET"}**
Fund Level: **AUM: $${aum || 100} Million** | **Reputation Rank: ${reputation || 15}**

#### SYSTEM OVERVIEW:
Our core algorithms detect heavy structural adjustments. Quantitative flows indicate that elite AI Bosses (Titan, Phoenix, Quantum) are reallocating capital into high-drift alternative nodes.

#### CYBER THREAT ASSESSMENT:
- **Momentum Vectors**: Titan Capital is heavily sizing technology-focused momentum sectors.
- **Inflation Swell**: Commodity sectors (Gold and Helium-3) present solid hedging metrics.
- **Rogue Intelligence Alert**: *Nexus AI* is monitoring our portfolio allocations. Maintain Sharpe ratios above 2.2 to prevent algorithmic arbitrage attacks.

*Report compiled by QIA Cyber Intelligence Drone. Secure decryption key active.*`
    });
  }

  try {
    const aiPrompt = promptQuery 
      ? `You are the chief AI Research Droid of a trillion-dollar quant hedge fund in a cyberpunk future (Year 2045). The player just asked: "${promptQuery}".
      Write a highly thematic, strategic, and tactical quantitative finance advisory. Include cyberpunk jargon, reference real/cyber hedge funds (Titan Capital, Omega Alpha, Nexus AI), and give quantitative tips (e.g. stop losses, Sharpe ratio, Markowitz optimization, commodities as a hedge under inflation, crypto vol). Limit the response to 300 words. Format beautifully with Markdown headings.`
      : `You are the chief AI Research Droid of a trillion-dollar quant hedge fund in a cyberpunk future (Year 2045). 
      Generate a Monthly Strategic Macro Market Report. 
      Details:
      - Current Market Regime: ${currentRegime}
      - Player Fund status: $${aum}M AUM, Reputation: ${reputation}/100.
      Provide detailed macro insights, warn about rival bosses, and offer quantitative trading tips relevant to the current regime (e.g., if Recession, advise bonds and gold; if Inflation Shock, advise commodities; if AI Revolution, advise Tech and AI Coins). Use gorgeous cyberpunk strategic terminology. Limit to 350 words. Format with Markdown headings.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: aiPrompt,
    });

    res.json({
      report: response.text || "Failed to compile generative intelligence core reports."
    });
  } catch (err: any) {
    console.error("Gemini API error inside server:", err);
    res.json({
      report: `### SYSTEM CONNECTION ERROR - QIA TERMINAL OFFLINE
      
*Quantum transceiver failed to establish link with Gemini Central Intelligence.*
Fallback intelligence suggests focusing on high Sharpe-ratio assets and training your ML classifiers immediately.`
    });
  }
});

// POST /api/research/news (AI Generated / Dynamic Market News)
app.post("/api/research/news", async (req: Request, res: Response) => {
  const { currentRegime, activeEvents } = req.body;
  
  const fallbackNews: Record<string, any[]> = {
    BULL: [
      { id: "bull_1", title: "S&P 500 Touches All-Time Highs as Productivity Gains Outpace Projections", content: "Broad-based earnings growth and robust consumer demand push benchmark indices to new historical heights. Systematic funds increase equity allocations.", category: "Macro", sentiment: "Bullish", impactScore: 85, timestamp: "1h ago" },
      { id: "bull_2", title: "Institutional Inflows Accelerate Into Equities; Risk-On Mode Solidifies", content: "Global pension funds and sovereign wealth managers reallocate cash reserves back into high-beta equities, signaling sustained confidence.", category: "Sector", sentiment: "Bullish", impactScore: 78, timestamp: "3h ago" },
      { id: "bull_3", title: "Retail Sentiment Surveys Hit Multi-Decade Highs; Cash Holdings Decrease", content: "Individual accounts continue to deploy capital into growth stocks and digital assets. Defensive allocations are reduced to historic lows.", category: "Macro", sentiment: "Bullish", impactScore: 65, timestamp: "5h ago" },
      { id: "bull_4", title: "Crypto Rally Gathers Steam as Institutional Liquidity Inundates Top Tokens", content: "Major digital currencies breakthrough critical technical resistance levels, supported by strong spot inflows and legal settlement optimism.", category: "Crypto", sentiment: "Bullish", impactScore: 72, timestamp: "7h ago", relatedSymbol: "BTC" }
    ],
    BEAR: [
      { id: "bear_1", title: "Broad Market Capitulation Continues as Margin Calls Force Systematic Liquidation", content: "Heavy selling across major indices triggers stop-loss cascades. Risk management desks order immediate reduction in gross leveraged exposures.", category: "Macro", sentiment: "Bearish", impactScore: 90, timestamp: "1h ago" },
      { id: "bear_2", title: "VIX Spikes Above 28 as Defensive Reallocations Drag Equities Deeper into Red", content: "Volatility index hits highest levels in 18 months. Portfolio managers rush to purchase downside insurance, driving put option premiums to extremes.", category: "Macro", sentiment: "Bearish", impactScore: 82, timestamp: "3h ago" },
      { id: "bear_3", title: "Capital Flees High-Beta Tech Toward Sovereign Yields; Nasdaq Off 4.2%", content: "Risk aversion dominates as growth multiples face severe compression. Safe haven flows provide support to short-duration Treasury bonds.", category: "Sector", sentiment: "Bearish", impactScore: 75, timestamp: "4h ago", relatedSymbol: "AAPL" },
      { id: "bear_4", title: "Crypto Markets Retrace 20% Following SEC Regulatory Crackdown Rumors", content: "Regulatory uncertainties trigger heavy leveraged liquidations. Analysts warn of technical damage to long-term charts.", category: "Crypto", sentiment: "Bearish", impactScore: 70, timestamp: "6h ago", relatedSymbol: "ETH" }
    ],
    RECESSION: [
      { id: "rec_1", title: "Yield Curve Remains Deeply Inverted; Corporate Earnings Collapse 14% Nationally", content: "The persistent inversion of the treasury curve continues to signal deep structural contraction. Leading industrial conglomerates cut guidance.", category: "Macro", sentiment: "Bearish", impactScore: 88, timestamp: "2h ago" },
      { id: "rec_2", title: "Treasuries Post Best Month Since 2029 as Investors Prioritize Capital Preservation", content: "Capital flocking to sovereign debt drives yields down significantly. Fixed-income portfolios demonstrate strong defensive alpha.", category: "Policy", sentiment: "Bullish", impactScore: 74, timestamp: "4h ago", relatedSymbol: "US10Y" },
      { id: "rec_3", title: "Sovereign Debt Outperforms Equities for Third Consecutive Quarter", content: "Recessionary forces consolidate within the labor market. Central bank signals potential rate cuts to stimulate economic activity.", category: "Policy", sentiment: "Neutral", impactScore: 68, timestamp: "6h ago" },
      { id: "rec_4", title: "Retail Giants Report Slowing Consumer Spend; Hard Landing Fears Confirmed", content: "High unemployment metrics and flat real wage growth severely impact household consumption. Luxury brands post consecutive declines.", category: "Sector", sentiment: "Bearish", impactScore: 80, timestamp: "8h ago" }
    ],
    INFLATION_SHOCK: [
      { id: "inf_1", title: "Commodities Index Rises to Historic Peak; Crude Oil Crosses $140/bbl", content: "Severe supply-side constraints and geopolitical bottlenecks drive energy prices to record levels. Commodity-focused funds post explosive returns.", category: "Commodities", sentiment: "Bullish", impactScore: 92, timestamp: "1h ago", relatedSymbol: "OIL" },
      { id: "inf_2", title: "CPI Prints 8.4% YoY, Forcing Central Bank to Contemplate Emergency Rate Hikes", content: "Sticky service-sector inflation prints well above consensus. Markets discount a aggressive 75bps rate hike at the upcoming meeting.", category: "Policy", sentiment: "Bearish", impactScore: 86, timestamp: "3h ago" },
      { id: "inf_3", title: "Industrial Metals Surge as Commodity Super-Cycle is Declared by Specialists", content: "Copper, lithium, and helium-3 post double-digit monthly gains on intensive infrastructure demand and flat global reserves.", category: "Commodities", sentiment: "Bullish", impactScore: 80, timestamp: "5h ago", relatedSymbol: "COPR" },
      { id: "inf_4", title: "Treasury Yields Spurt Upward; Bond Investors Suffer Severe Duration Drag", content: "Fixed-income capital is decimated as skyrocketing inflation erodes real yield expectations. Portfolio durations are drastically shortened.", category: "Sector", sentiment: "Bearish", impactScore: 78, timestamp: "7h ago", relatedSymbol: "US30Y" }
    ],
    TECH_BUBBLE: [
      { id: "tb_1", title: "Silicon Valley Valuation Multiples Reach 120x Forward Earnings", content: "Extreme speculation reminiscent of 1999 drives technology indices to parabolic heights. Short-sellers face total wipeout.", category: "Sector", sentiment: "Bullish", impactScore: 94, timestamp: "1h ago", relatedSymbol: "MSFT" },
      { id: "tb_2", title: "NVIDIA Competitor IPO Closes Up 280% on Opening Day; Mania Intensifies", content: "Retail and institutional demand for hardware providers reaches fever pitch. Analysts warn of structural divergence from fundamental cash flows.", category: "Sector", sentiment: "Bullish", impactScore: 85, timestamp: "3h ago", relatedSymbol: "NVDA" },
      { id: "tb_3", title: "Hedge Funds Increase Net Exposure to Semiconductor Sub-Indices", content: "Momentum-driven quant strategies deploy maximum leverage to participate in the parabolic tech run. Growth factor dominance continues.", category: "Macro", sentiment: "Bullish", impactScore: 72, timestamp: "5h ago", relatedSymbol: "AMD" },
      { id: "tb_4", title: "Skeptics Warn of Impending Capital Crunch as Tech Capex Outpaces Revenue Growth", content: "A minority of value-focused managers warn that massive capital expenditure on compute facilities has failed to produce organic revenues.", category: "Macro", sentiment: "Neutral", impactScore: 60, timestamp: "8h ago" }
    ],
    AI_REVOLUTION: [
      { id: "ai_1", title: "Autonomous Trading Systems Now Control 94% of Global Financial Volumes", content: "Hyper-speed quantitative models squeeze human discretionary desks out of the marketplace. Algorithmic latency becomes the primary alpha metric.", category: "Policy", sentiment: "Bullish", impactScore: 96, timestamp: "1h ago" },
      { id: "ai_2", title: "Compute Power Recognized as New Global Currency: Tech Leaders Pledge Massive Expansion", content: "Data center infrastructure and power grid agreements take center stage. Equities exposed to compute grids trade at extreme premium.", category: "Sector", sentiment: "Bullish", impactScore: 88, timestamp: "3h ago", relatedSymbol: "NVDA" },
      { id: "ai_3", title: "Hedge Fund AI Rivals (Titan, Nexus AI) Post Record Performance", content: "Advanced machine-learning neural networks outperform human benchmarks by an average of 1,200 basis points this quarter.", category: "Macro", sentiment: "Bullish", impactScore: 82, timestamp: "5h ago" },
      { id: "ai_4", title: "Decentralized AI Networks Witness Hyper-Accretion of Financial Capital", content: "Venture flows migrate into open-source autonomous agent frameworks. AI tokens and coins capture massive volume.", category: "Crypto", sentiment: "Bullish", impactScore: 85, timestamp: "6h ago", relatedSymbol: "FET" }
    ],
    FINANCIAL_CRISIS: [
      { id: "fc_1", title: "Liquidity Dry-Up in Commercial Paper Markets Prompts Emergency Central Bank Cash Injections", content: "Unprecedented collateral squeeze threatens major money market funds. Interbank lending rates spike to crisis levels as trust evaporates.", category: "Macro", sentiment: "Bearish", impactScore: 98, timestamp: "1h ago" },
      { id: "fc_2", title: "Major Global Lender Suspends Redemption Requests; Systematic Contagion Fears Rise", content: "Panic spreads through credit markets as a top tier investment bank freezes withdrawal channels. Equities experience immediate 5% limit-down.", category: "Macro", sentiment: "Bearish", impactScore: 95, timestamp: "3h ago" },
      { id: "fc_3", title: "Safe Haven Surge: Gold Reaches Unprecedented Levels Amid Systemic Trust Deficit", content: "Investors liquidate paper assets and flow cash directly into physical spot gold and short-duration sovereign bills.", category: "Commodities", sentiment: "Bullish", impactScore: 88, timestamp: "5h ago", relatedSymbol: "GOLD" },
      { id: "fc_4", title: "Systemic Risk Thermometer Reaches Absolute Red; Cash is Sovereign", content: "Fund managers liquidate equity positions to accumulate cash and defensive bonds. Cash yield spreads narrow.", category: "Policy", sentiment: "Bearish", impactScore: 90, timestamp: "6h ago", relatedSymbol: "US10Y" }
    ],
    BLACK_SWAN: [
      { id: "bs_1", title: "Solar Storm Knocks Out Satellite Arrays, Halting High-Frequency Trading Terminals", content: "Cosmic radiation strikes orbital transceivers, causing massive data fragmentation and forcing emergency manual exchange halts.", category: "Macro", sentiment: "Bearish", impactScore: 99, timestamp: "1h ago" },
      { id: "bs_2", title: "Rogue AI Initiates Market Flash Crash; $2.5T Wiped Out in 12 Minutes", content: "A malfunctioning autonomous reinforcement-learning algorithm executes rapid-fire short orders across multiple asset classes before isolation.", category: "Sector", sentiment: "Bearish", impactScore: 97, timestamp: "3h ago" },
      { id: "bs_3", title: "Emergency Capital Controls Enacted Across Leading G20 Sovereignties", content: "National treasuries freeze international fund flow transfers and enforce mandatory trade collars to stabilize exchange rates.", category: "Policy", sentiment: "Bearish", impactScore: 92, timestamp: "4h ago" },
      { id: "bs_4", title: "Physical Alternative Commodities Experience Parabolic Swings as Derivatives Markets Fail", content: "Failure-to-deliver events cascade through paper-clearing houses. Physical asset spot prices decouple from futures indices.", category: "Commodities", sentiment: "Neutral", impactScore: 88, timestamp: "6h ago", relatedSymbol: "MCRE" }
    ]
  };

  const currentRegimeKey = (currentRegime || "BULL") as string;
  const articles = fallbackNews[currentRegimeKey] || fallbackNews.BULL;

  if (!aiClient) {
    return res.json({ news: articles });
  }

  try {
    const aiPrompt = `You are a financial news intelligence bot in a high-tech financial strategy game set in the year 2045.
    Generate 4 realistic, professional, data-rich Bloomberg/Reuters-style financial news headlines and articles appropriate for the current market state.
    Current Market Regime: ${currentRegimeKey}. Active events: ${JSON.stringify(activeEvents || [])}.
    Format your response as a strict JSON array of news articles.
    Each article MUST contain these fields:
    - id: unique string
    - title: professional, institutional-style headline (e.g. "Yield Curve Deepens Inversion as Employment Stats Cool")
    - content: 2-3 sentences of highly detailed, realistic, professional quantitative finance analysis
    - category: one of ["Macro", "Sector", "Crypto", "Commodities", "Policy"]
    - sentiment: one of ["Bullish", "Bearish", "Neutral"]
    - impactScore: an integer between 10 and 100
    - timestamp: one of ["15m ago", "1h ago", "3h ago", "6h ago"]
    - relatedSymbol: optional (e.g. "BTC", "GOLD", "AAPL", "NVDA", "US10Y")
    
    Make the style extremely professional, calm, realistic, and highly intelligent (like Bloomberg Terminal news). Do not use cyberpunk slang like "cyber droids" here — use authentic institutional finance terms.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: aiPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              category: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              impactScore: { type: Type.INTEGER },
              timestamp: { type: Type.STRING },
              relatedSymbol: { type: Type.STRING },
            },
            required: ["id", "title", "content", "category", "sentiment", "impactScore", "timestamp"]
          }
        }
      }
    });

    const parsedNews = JSON.parse(response.text || "[]");
    if (Array.isArray(parsedNews) && parsedNews.length > 0) {
      return res.json({ news: parsedNews });
    }
    return res.json({ news: articles });
  } catch (err) {
    console.error("Gemini API error generating news, using high-fidelity fallback:", err);
    return res.json({ news: articles });
  }
});

// POST /api/trade (Simulate Turn Transition / Core Gameplay Engine)
app.post("/api/trade", (req: Request, res: Response) => {
  const { gameState } = req.body;
  if (!gameState) {
    return res.status(400).json({ error: "Missing gameState in request body" });
  }

  const state = gameState as GameState;
  
  // 1. Progress Date
  let nextMonth = state.month + 1;
  let nextYear = state.year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  // 2. Select Next Market Regime
  // 15% probability of a random switch, otherwise maintains current regime
  let nextRegime = state.regime;
  if (Math.random() < 0.20) {
    const regimes = Object.values(MarketRegimeType);
    nextRegime = regimes[Math.floor(Math.random() * regimes.length)] as MarketRegimeType;
  }

  // 3. Resolve active events duration
  const activeEvents = state.activeEvents.map(e => ({
    ...e,
    duration: e.duration - 1
  })).filter(e => e.duration > 0);

  // Trigger a potential new random event (15% probability)
  if (Math.random() < 0.15 && activeEvents.length === 0) {
    const randomEventTemplate = gameEventsList[Math.floor(Math.random() * gameEventsList.length)];
    activeEvents.push({ ...randomEventTemplate });
  }

  // 4. Calculate All Asset Monthly Returns for the month
  const updatedAssets = gameAssets.map(asset => {
    // Base monthly drift (annual drift / 12)
    let monthlyDrift = asset.drift / 12;
    let monthlyVol = asset.volatility / Math.sqrt(12);

    // Apply Regime multipliers
    if (nextRegime === MarketRegimeType.BULL) {
      if (asset.category === AssetCategory.EQUITIES || asset.category === AssetCategory.CRYPTO) {
        monthlyDrift += 0.015;
        monthlyVol *= 0.8;
      }
    } else if (nextRegime === MarketRegimeType.BEAR) {
      if (asset.category === AssetCategory.EQUITIES || asset.category === AssetCategory.CRYPTO) {
        monthlyDrift -= 0.025;
        monthlyVol *= 1.4;
      }
      if (asset.category === AssetCategory.COMMODITIES || asset.category === AssetCategory.BONDS) {
        monthlyDrift += 0.005;
      }
    } else if (nextRegime === MarketRegimeType.RECESSION) {
      if (asset.category === AssetCategory.EQUITIES) monthlyDrift -= 0.012;
      if (asset.category === AssetCategory.BONDS) {
        monthlyDrift += 0.008; // defensive asset outperformance
        monthlyVol *= 0.6;
      }
    } else if (nextRegime === MarketRegimeType.INFLATION_SHOCK) {
      if (asset.category === AssetCategory.COMMODITIES) {
        monthlyDrift += 0.035; // Commodities surge!
        monthlyVol *= 1.2;
      }
      if (asset.category === AssetCategory.BONDS) monthlyDrift -= 0.015;
    } else if (nextRegime === MarketRegimeType.TECH_BUBBLE) {
      if (asset.sector === "Technology") {
        monthlyDrift += 0.045; // tech explodes!
        monthlyVol *= 1.3;
      }
    } else if (nextRegime === MarketRegimeType.AI_REVOLUTION) {
      if (asset.sector === "AI Coins" || asset.sector === "Technology") {
        monthlyDrift += 0.055; // AI assets skyrocket
        monthlyVol *= 1.1;
      }
    } else if (nextRegime === MarketRegimeType.FINANCIAL_CRISIS) {
      monthlyDrift -= 0.04; // huge selloff
      monthlyVol *= 1.8;
      if (asset.symbol === "GOLD" || asset.category === AssetCategory.BONDS) {
        monthlyDrift += 0.012; // Gold and Bonds surge as safe havens
      }
    } else if (nextRegime === MarketRegimeType.BLACK_SWAN) {
      // High randomness
      monthlyDrift += (Math.random() - 0.55) * 0.15;
      monthlyVol *= 2.2;
    }

    // Apply active event effects
    activeEvents.forEach(e => {
      let applies = false;
      if (e.impactType === "all") applies = true;
      else if (e.impactType === "crypto" && asset.category === AssetCategory.CRYPTO) applies = true;
      else if (e.impactType === "commodities" && asset.category === AssetCategory.COMMODITIES) applies = true;
      else if (e.impactType === "tech" && (asset.sector === "Technology" || asset.sector === "AI Coins")) applies = true;
      else if (e.impactType === "crisis" && (asset.category === AssetCategory.EQUITIES || asset.category === AssetCategory.CRYPTO)) applies = true;

      if (applies) {
        monthlyDrift += e.effect.driftOffset / 12;
        monthlyVol *= e.effect.volatilityMultiplier;
      }
    });

    // Simulated Random Return via Geometric Brownian approximation
    const normalRandom = (Math.random() + Math.random() + Math.random() - 1.5) * 0.816;
    const monthlyReturn = monthlyDrift + monthlyVol * normalRandom;
    
    // Update asset price
    const newPrice = Math.max(0.1, asset.price * (1 + monthlyReturn));

    const currentChange = parseFloat((monthlyReturn * 100).toFixed(2));
    const nextHistory6m = [...(asset.history6m || [])].slice(-5);
    nextHistory6m.push(currentChange);

    return {
      ...asset,
      price: parseFloat(newPrice.toFixed(2)),
      change: currentChange,
      history6m: nextHistory6m
    };
  });

  // Keep full procedural database in sync
  gameAssets = updatedAssets;

  // 5. Calculate Player Portfolio performance
  const playerAllocations = state.portfolio.allocations;
  const leverageMultiplier = Math.max(1.0, Math.min(3.0, state.portfolio.leverage || 1.0));
  
  let playerPortReturn = 0;
  let allocatedWeightSum = 0;

  // Track allocation weights
  Object.keys(playerAllocations).forEach(assetId => {
    const weight = playerAllocations[assetId] || 0;
    const matchedAsset = updatedAssets.find(a => a.id === assetId);
    if (matchedAsset && weight > 0) {
      playerPortReturn += (weight / 100) * (matchedAsset.change / 100);
      allocatedWeightSum += weight;
    }
  });

  // Calculate leverage risk and apply returns
  playerPortReturn = playerPortReturn * leverageMultiplier;

  // If player hasn't allocated full 100%, remainder stays in cash earning risk-free yield
  const cashWeight = Math.max(0, 100 - allocatedWeightSum) / 100;
  const cashYield = (0.045 / 12) * cashWeight; // 4.5% annual cash yield
  playerPortReturn += cashYield;

  // Apply visual strategy builder boost if active
  let strategyAlpha = 0;
  const activeSigs = state.customStrategy.signals.filter(s => s.active).length;
  const activeFilts = state.customStrategy.filters.filter(f => f.active).length;
  const activeRuls = state.customStrategy.rules.filter(r => r.active).length;
  
  if (activeSigs > 0 || activeFilts > 0) {
    // Strategy gives an analytical alpha bump (+0.1% return per active element)
    strategyAlpha = (activeSigs * 0.0012) + (activeFilts * 0.0006);
    playerPortReturn += strategyAlpha;
  }

  // Adjust returns for stop losses
  if (state.customStrategy.rules.some(r => r.id === "rule_stop" && r.active) && playerPortReturn < -0.04) {
    playerPortReturn = -0.015; // Stop loss limits losses
  }

  // Apply Machine Learning boost multiplier trained in Quant Lab
  let mlPerformanceBoost = 1.0;
  state.mlModels.forEach(m => {
    if (m.trained) {
      mlPerformanceBoost += m.boost;
    }
  });
  
  if (playerPortReturn > 0) {
    playerPortReturn *= mlPerformanceBoost; // scale up positive returns
  } else {
    playerPortReturn *= (2 - mlPerformanceBoost); // scale down negative returns
  }

  // Cap absolute massive collapse
  playerPortReturn = Math.max(-0.95, playerPortReturn);

  // Compute final dollar changes
  const initialAUM = state.aum;
  const earnings = initialAUM * playerPortReturn;
  let endingPlayerAUM = initialAUM + earnings;

  // Calculate Sharpe for reputation & flows
  // Simple rolling Sharpe
  const recentHistory = state.history.slice(-12);
  const returnsList = recentHistory.map(h => h.returnRate).concat(playerPortReturn);
  const meanHistReturn = returnsList.reduce((a, b) => a + b, 0) / returnsList.length;
  const varHist = returnsList.reduce((a, b) => a + Math.pow(b - meanHistReturn, 2), 0) / returnsList.length;
  const rollingSharpe = varHist > 0 ? (meanHistReturn * 12 - 0.045) / (Math.sqrt(varHist) * Math.sqrt(12)) : 1.2;

  // 6. Investor Flow engine
  let totalInvestorFlow = 0;
  const updatedInvestors = state.investors.map(inv => {
    let confChange = 0;
    
    // Performance triggers confidence
    if (playerPortReturn > 0.015) {
      confChange += 8;
    } else if (playerPortReturn < -0.02) {
      confChange -= (inv.volatilityTolerance === "low" ? 15 : 6);
    }

    // High Sharpe / reputation multiplier
    if (rollingSharpe >= inv.minSharpe && state.reputation >= inv.minReputation) {
      confChange += 5;
    } else {
      confChange -= 4;
    }

    const nextConf = Math.max(0, Math.min(100, inv.currentConfidence + confChange));
    
    // Calculate actual dollar inflow/outflows
    let monthlyFlow = 0;
    if (nextConf > 55) {
      // Inflow
      const inflowFactor = (nextConf - 55) / 45;
      monthlyFlow = (inv.sharePercent * 12) * inflowFactor; // scale flow in Millions
    } else if (nextConf < 35) {
      // Redemption Outflow
      const outflowFactor = (35 - nextConf) / 35;
      monthlyFlow = - (inv.totalInvested * 0.12) * outflowFactor; // max 12% monthly redemption
    }

    const nextInvested = Math.max(0, inv.totalInvested + monthlyFlow);
    totalInvestorFlow += monthlyFlow;

    return {
      ...inv,
      currentConfidence: nextConf,
      totalInvested: parseFloat(nextInvested.toFixed(2))
    };
  });

  // Adjust Player AUM for inflows/outflows
  endingPlayerAUM += totalInvestorFlow;
  endingPlayerAUM = Math.max(1, endingPlayerAUM); // prevent complete absolute bankrupt to let them survive

  // 7. Update Reputation based on returns and Sharpe
  let nextReputation = state.reputation;
  if (playerPortReturn > 0.02) nextReputation += 3;
  else if (playerPortReturn < -0.03) nextReputation -= 2;
  nextReputation = Math.max(0, Math.min(100, nextReputation));

  // 8. Simulate AI Rival Bosses Monthly Performance
  let titanReturn = 0.015 + (Math.random() - 0.45) * 0.12; // Hyper momentum: high volatility
  let omegaReturn = 0.012 + (Math.random() - 0.46) * 0.05; // Copycat / ML: steady
  let phoenixReturn = 0.008 + (Math.random() - 0.48) * 0.04; // Macro tactical: defensive
  let quantumReturn = 0.006 + (Math.random() - 0.5) * 0.015; // StatArb: low volatility, consistent
  let nexusReturn = 0.025 + (Math.random() - 0.44) * 0.07; // Hybrid superintelligence: supreme alpha

  // Phoenix predicts crisis
  if (nextRegime === MarketRegimeType.FINANCIAL_CRISIS || nextRegime === MarketRegimeType.RECESSION) {
    phoenixReturn = 0.035; // Phoenix predicted the crisis and shorted
    titanReturn = -0.15; // Titan got caught long-only momentum
    nexusReturn = 0.04; // Supreme adaptation
  }

  // Update AI Rivals AUM
  const updatedLeaderboard = state.leaderboard.map(leader => {
    let returnRate = 0;
    let aumChange = 1.0;

    if (leader.id === "nexus_ai") {
      returnRate = nexusReturn;
      aumChange = (1 + returnRate) + 0.008; // heavy organic backing
    } else if (leader.id === "omega_alpha") {
      returnRate = omegaReturn;
      aumChange = (1 + returnRate) + 0.003;
    } else if (leader.id === "phoenix_global") {
      returnRate = phoenixReturn;
      aumChange = (1 + returnRate) + 0.002;
    } else if (leader.id === "titan_capital") {
      returnRate = titanReturn;
      aumChange = (1 + returnRate);
    } else if (leader.id === "quantum_arb") {
      returnRate = quantumReturn;
      aumChange = (1 + returnRate) + 0.001;
    } else if (leader.id === "player_fund") {
      return {
        ...leader,
        aum: parseFloat(endingPlayerAUM.toFixed(2)),
        reputation: nextReputation,
        monthlyReturn: parseFloat((playerPortReturn * 100).toFixed(2)),
        sharpeRatio: parseFloat(rollingSharpe.toFixed(2)),
      };
    }

    const nextAum = Math.max(50, leader.aum * aumChange);

    return {
      ...leader,
      aum: parseFloat(nextAum.toFixed(2)),
      monthlyReturn: parseFloat((returnRate * 100).toFixed(2)),
    };
  });

  // Resort Leaderboard
  const sortedLeaderboard = updatedLeaderboard.sort((a, b) => b.aum - a.aum);
  const finalLeaderboard = sortedLeaderboard.map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  const playerRank = finalLeaderboard.find(l => l.isPlayer)?.rank || 6;

  // 9. Append History record
  const currentRecord: HistoricalRecord = {
    month: state.month,
    year: state.year,
    aum: parseFloat(endingPlayerAUM.toFixed(2)),
    cash: parseFloat((endingPlayerAUM * cashWeight).toFixed(2)),
    returnRate: parseFloat((playerPortReturn * 100).toFixed(2)),
    sharpe: parseFloat(rollingSharpe.toFixed(2)),
    regime: state.regime,
    benchmarkReturn: parseFloat(((0.008 + (Math.random() - 0.48) * 0.05) * 100).toFixed(2))
  };
  const updatedHistory = [...state.history, currentRecord];

  // 10. Check Endgame States
  let nextGameStatus = state.gameStatus;
  let finalBossBeaten = state.finalBossBeaten;
  let unlockedElite = state.unlockedElite;

  if (endingPlayerAUM >= 100000) {
    unlockedElite = true; // Over $100 Billion AUM unlocks Elite Quants
  }

  // WIN CONDITION: Beats NEXUS AI at $1 Trillion AUM, Reputation 100, Rank 1
  if (endingPlayerAUM >= 1000000 && nextReputation >= 99 && playerRank === 1) {
    nextGameStatus = "won";
    finalBossBeaten = true;
  }

  // LOSE CONDITION: AUM drops below $2M
  if (endingPlayerAUM < 2.0) {
    nextGameStatus = "lost";
  }

  const nextGameState: GameState = {
    ...state,
    month: nextMonth,
    year: nextYear,
    aum: parseFloat(endingPlayerAUM.toFixed(2)),
    reputation: nextReputation,
    regime: nextRegime,
    activeEvents,
    portfolio: {
      ...state.portfolio,
      cash: parseFloat((endingPlayerAUM * cashWeight).toFixed(2))
    },
    assets: updatedAssets.slice(0, 50), // snapshot for the UI listing
    history: updatedHistory,
    leaderboard: finalLeaderboard,
    investors: updatedInvestors,
    unlockedElite,
    finalBossBeaten,
    gameStatus: nextGameStatus,
    currentTurnComplete: true
  };

  res.json(nextGameState);
});

// Create Vite server and handle routes
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Quant Arena Server booted successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
