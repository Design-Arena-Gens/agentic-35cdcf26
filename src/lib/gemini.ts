import { Content, GoogleGenerativeAI } from "@google/generative-ai";
import { getServerEnv } from "@/lib/env";

const MODEL_NAME = "gemini-1.5-flash-latest";

const systemInstruction = `
You are an expert FX trading assistant.
You must:
- Analyse the provided market data and indicators.
- Produce a clear recommendation: buy, sell, or hold.
- Provide confidence metrics between 0 and 1.
- Suggest stop loss and take profit levels in pips.
- Highlight risks and justifications.

Return JSON with the following shape:
{
  "action": "buy" | "sell" | "hold",
  "confidence": number,
  "stopLossPips": number,
  "takeProfitPips": number,
  "rationale": string,
  "riskFactors": string[]
}
`;

export type GeminiSignal = {
  action: "buy" | "sell" | "hold";
  confidence: number;
  stopLossPips: number;
  takeProfitPips: number;
  rationale: string;
  riskFactors: string[];
};

type AnalysisPayload = {
  symbol: string;
  timeframe: string;
  candles: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  indicators: Record<string, number>;
  account: {
    equity: number;
    balance: number;
    leverage: number;
    freeMargin: number;
  };
  riskProfile: {
    riskPerTrade: number;
    maxConcurrentTrades: number;
    maxDrawdown: number;
  };
};

const parseJsonResponse = (responseText: string): GeminiSignal => {
  try {
    const parsed = JSON.parse(responseText) as GeminiSignal;
    if (
      parsed &&
      ["buy", "sell", "hold"].includes(parsed.action) &&
      typeof parsed.confidence === "number"
    ) {
      return parsed;
    }
  } catch {
    // fall through to default return
  }

  return {
    action: "hold",
    confidence: 0,
    stopLossPips: 0,
    takeProfitPips: 0,
    rationale: "Failed to parse Gemini response",
    riskFactors: ["Unable to parse AI output"],
  };
};

export const requestSignalFromGemini = async (
  payload: AnalysisPayload,
): Promise<GeminiSignal> => {
  const env = getServerEnv();
  const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
    },
  });

  const prompt: Content[] = [
    {
      role: "user",
      parts: [
        {
          text: JSON.stringify(payload),
        },
      ],
    },
  ];

  const result = await model.generateContent({
    contents: prompt,
  });

  const text = result.response.text() ?? "";
  return parseJsonResponse(text.trim());
};
