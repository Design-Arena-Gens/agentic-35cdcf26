import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { clsx } from "clsx";

type StrategyFormProps = {
  onAnalyze: (payload: AnalyzePayload) => Promise<void>;
  loading?: boolean;
};

export type AnalyzePayload = {
  symbol: string;
  timeframe: string;
  riskPerTrade: number;
  maxConcurrentTrades: number;
  maxDrawdown: number;
  magicNumber: number;
  autoExecute: boolean;
};

const labelClass =
  "text-sm font-medium text-zinc-700 dark:text-zinc-200 flex items-center justify-between";

export const StrategyForm = ({
  onAnalyze,
  loading = false,
}: StrategyFormProps) => {
  const [form, setForm] = useState<AnalyzePayload>({
    symbol: "EURUSD",
    timeframe: "M5",
    riskPerTrade: 1,
    maxConcurrentTrades: 3,
    maxDrawdown: 12,
    magicNumber: 20250118,
    autoExecute: false,
  });

  const handleChange = (
    field: keyof AnalyzePayload,
    value: string | number | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        typeof prev[field] === "number"
          ? Number(value)
          : typeof prev[field] === "boolean"
            ? Boolean(value)
            : (value as string),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onAnalyze(form);
  };

  return (
    <Card>
      <CardHeader
        title="Strategy Controls"
        description="Adjust the AI risk parameters and trigger analysis."
      />
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Pair
              <input
                type="text"
                value={form.symbol}
                onChange={(event) =>
                  handleChange("symbol", event.target.value.toUpperCase())
                }
                maxLength={6}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className={labelClass}>
              Timeframe
              <select
                value={form.timeframe}
                onChange={(event) => handleChange("timeframe", event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="M1">M1</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="H1">H1</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Risk / Trade (%)
              <input
                type="number"
                min={0.1}
                max={5}
                step={0.1}
                value={form.riskPerTrade}
                onChange={(event) => handleChange("riskPerTrade", event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className={labelClass}>
              Max Positions
              <input
                type="number"
                min={1}
                max={10}
                value={form.maxConcurrentTrades}
                onChange={(event) =>
                  handleChange("maxConcurrentTrades", event.target.value)
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className={labelClass}>
              Max Drawdown (%)
              <input
                type="number"
                min={1}
                max={50}
                value={form.maxDrawdown}
                onChange={(event) => handleChange("maxDrawdown", event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>

          <label className={labelClass}>
            Magic Number
            <input
              type="number"
              value={form.magicNumber}
              onChange={(event) => handleChange("magicNumber", event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>

          <label
            className={clsx(
              labelClass,
              "items-start gap-3 rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-700",
            )}
          >
            <div>
              <div className="text-sm font-semibold">
                Autonomous Execution
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                When enabled, trades are pushed directly to MetaTrader after AI
                approval. Double-check your risk settings first.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.autoExecute}
              onChange={(event) => handleChange("autoExecute", event.target.checked)}
              className="mt-1 h-5 w-5 rounded border border-zinc-300 bg-white text-indigo-600 focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "Analyzing…" : "Run AI Analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
