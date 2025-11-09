import { getAccountSnapshot, getOpenPositions } from "@/lib/metaapi";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [account, positions] = await Promise.all([
      getAccountSnapshot(),
      getOpenPositions(),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        account,
        positions,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to load account",
      },
      { status: 500 },
    );
  }
}
