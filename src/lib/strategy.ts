import { requestSignalFromGemini } from "@/lib/gemini";
import { buildIndicatorSnapshot } from "@/lib/indicators";
import { fetchForexCandles } from "@/lib/market-data";
import {
  calculateLotSize,
  executeTrade,
  getAccountSnapshot,
  type TradeAction,
  type TradeRequest,
} from "@/lib/metaapi";

export type RiskProfile = {
  riskPerTrade: number;
  maxConcurrentTrades: number;
  maxDrawdown: number;
};

export type StrategySettings = {
  symbol: string;
  timeframe: string;
  riskProfile: RiskProfile;
  magicNumber: number;
};

export type AnalysisResult = {
  signal: Awaited<ReturnType<typeof requestSignalFromGemini>>;
  executedTradeId?: string;
  skippedReason?: string;
  lotSize?: number;
};

export const runStrategyCycle = async (
  settings: StrategySettings,
  autoExecute = false,
): Promise<AnalysisResult> => {
  const [candles, account] = await Promise.all([
    fetchForexCandles(settings.symbol, "5min", "compact"),
    getAccountSnapshot(),
  ]);

  const indicators = buildIndicatorSnapshot(candles);

  const signal = await requestSignalFromGemini({
    symbol: settings.symbol,
    timeframe: settings.timeframe,
    candles,
    indicators,
    account,
    riskProfile: settings.riskProfile,
  });

  if (signal.action === "hold") {
    return {
      signal,
      skippedReason: "AI recommended hold",
    };
  }

  if (signal.confidence < 0.55) {
    return {
      signal,
      skippedReason: "Confidence below execution threshold",
    };
  }

  const lotSize = await calculateLotSize(
    settings.symbol,
    settings.riskProfile.riskPerTrade,
    signal.stopLossPips,
  );

  if (!autoExecute) {
    return {
      signal,
      lotSize,
      skippedReason: "Auto execution disabled",
    };
  }

  const tradePayload: TradeRequest = {
    symbol: settings.symbol,
    action: signal.action as TradeAction,
    lotSize,
    stopLossPips: signal.stopLossPips,
    takeProfitPips: signal.takeProfitPips,
    magicNumber: settings.magicNumber,
    comment: `Gemini ${signal.action} @ ${settings.symbol}`,
  };

  const result = await executeTrade(tradePayload);

  return {
    signal,
    executedTradeId: result?.orderId ?? result?.positionId ?? undefined,
    lotSize,
  };
};
