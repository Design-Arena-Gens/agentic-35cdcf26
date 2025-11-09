import { executeTrade, type TradeAction } from "@/lib/metaapi";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  symbol: z.string().min(6),
  action: z.enum(["buy", "sell"]),
  lotSize: z.number().positive(),
  stopLossPips: z.number().positive(),
  takeProfitPips: z.number().positive(),
  magicNumber: z.number().int().default(18012025),
  comment: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);

    const result = await executeTrade({
      symbol: body.symbol,
      action: body.action as TradeAction,
      lotSize: body.lotSize,
      stopLossPips: body.stopLossPips,
      takeProfitPips: body.takeProfitPips,
      magicNumber: body.magicNumber,
      comment: body.comment,
    });

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Trade failed",
      },
      { status: 500 },
    );
  }
}
