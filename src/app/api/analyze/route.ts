import { runStrategyCycle } from "@/lib/strategy";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  symbol: z.string().min(6),
  timeframe: z.string().default("M5"),
  riskPerTrade: z.number().min(0.1).max(5),
  maxConcurrentTrades: z.number().min(1).max(10).default(3),
  maxDrawdown: z.number().min(1).max(50).default(10),
  magicNumber: z.number().int().default(18012025),
  autoExecute: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);

    const result = await runStrategyCycle(
      {
        symbol: body.symbol,
        timeframe: body.timeframe,
        riskProfile: {
          riskPerTrade: body.riskPerTrade,
          maxConcurrentTrades: body.maxConcurrentTrades,
          maxDrawdown: body.maxDrawdown,
        },
        magicNumber: body.magicNumber,
      },
      body.autoExecute,
    );

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to analyze market",
      },
      { status: 500 },
    );
  }
}
