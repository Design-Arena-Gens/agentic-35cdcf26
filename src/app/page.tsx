"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { AccountSummary } from "@/components/dashboard/account-summary";
import {
  PositionsTable,
  type Position,
} from "@/components/dashboard/positions-table";
import {
  StrategyForm,
  type AnalyzePayload,
} from "@/components/dashboard/strategy-form";
import { SignalPanel } from "@/components/dashboard/signal-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type StatusPayload = {
  account: {
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    leverage: number;
    currency: string;
  };
  positions: Position[];
};

type SignalState = {
  action?: "buy" | "sell" | "hold";
  confidence?: number;
  stopLossPips?: number;
  takeProfitPips?: number;
  rationale?: string;
  riskFactors?: string[];
  executedTradeId?: string;
  lotSize?: number;
  skippedReason?: string;
  symbol?: string;
  timeframe?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as ApiResult<StatusPayload>;
};

const Page = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [signalState, setSignalState] = useState<SignalState | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<ApiResult<StatusPayload>>(
    "/api/status",
    fetcher,
    {
      refreshInterval: 15_000,
    },
  );

  const triggerAnalyze = useCallback(
    async (payload: AnalyzePayload) => {
      setAnalyzing(true);
      setAlert(null);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = (await response.json()) as ApiResult<SignalState>;

        if (!response.ok || !json.ok) {
          throw new Error(json.error ?? "AI analysis failed");
        }

        setSignalState(
          json.data
            ? {
                ...json.data,
                symbol: payload.symbol,
                timeframe: payload.timeframe,
              }
            : null,
        );
        await mutate();

        if (json.data?.executedTradeId) {
          setAlert(
            `Trade executed successfully (ID ${json.data.executedTradeId}).`,
          );
        } else if (json.data?.skippedReason) {
          setAlert(`Signal skipped: ${json.data.skippedReason}.`);
        } else {
          setAlert("Signal generated. Review details below.");
        }
      } catch (analysisError) {
        setAlert(
          analysisError instanceof Error
            ? analysisError.message
            : "Unexpected AI error.",
        );
      } finally {
        setAnalyzing(false);
      }
    },
    [mutate],
  );

  const account = data?.data?.account;
  const positions = data?.data?.positions ?? [];

  const statusLabel = useMemo(() => {
    if (error) return "Disconnected";
    if (isLoading) return "Synchronizing…";
    return "Connected";
  }, [error, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 py-12 text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Gemini FX Autopilot
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Deploy an autonomous trading agent across your MetaTrader 5
              account. Configure risk, review signals, and toggle execution in
              real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={error ? "danger" : isLoading ? "warning" : "success"}>
              {statusLabel}
            </Badge>
            <Button
              variant="secondary"
              onClick={() => mutate()}
              disabled={isLoading}
            >
              Refresh Account
            </Button>
          </div>
        </header>

        {alert ? (
          <Card className="border-indigo-200 bg-indigo-50/80 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
            <CardContent>
              <p className="text-sm font-medium">{alert}</p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[2fr_1.25fr]">
          <div className="space-y-6">
            <AccountSummary
              balance={account?.balance}
              equity={account?.equity}
              freeMargin={account?.freeMargin}
              margin={account?.margin}
              currency={account?.currency}
              leverage={account?.leverage}
              confidence={signalState?.confidence}
              signalAction={signalState?.action}
              signalRationale={signalState?.rationale}
            />
            <PositionsTable positions={positions} />
          </div>
          <div className="space-y-6">
            <SignalPanel
              symbol={signalState?.symbol ?? "EURUSD"}
              timeframe={signalState?.timeframe ?? "M5"}
              action={signalState?.action}
              confidence={signalState?.confidence}
              stopLossPips={signalState?.stopLossPips}
              takeProfitPips={signalState?.takeProfitPips}
              rationale={signalState?.rationale}
              riskFactors={signalState?.riskFactors}
              lastExecutionId={signalState?.executedTradeId}
            />
            <StrategyForm onAnalyze={triggerAnalyze} loading={analyzing} />
          </div>
        </div>

        <footer className="mt-12 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Strategy outputs are powered by Gemini AI. Always validate signals
            and maintain manual oversight in volatile market conditions.
          </div>
          <div>MetaTrader 5 bridge powered by MetaApi.</div>
        </footer>
      </div>
    </div>
  );
};

export default Page;
