import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SignalPanelProps = {
  symbol: string;
  timeframe: string;
  action?: "buy" | "sell" | "hold";
  confidence?: number;
  stopLossPips?: number;
  takeProfitPips?: number;
  rationale?: string;
  riskFactors?: string[];
  lastExecutionId?: string;
};

const actionColor = (action?: "buy" | "sell" | "hold") => {
  if (action === "buy") return "text-emerald-500";
  if (action === "sell") return "text-rose-500";
  return "text-zinc-500";
};

export const SignalPanel = ({
  symbol,
  timeframe,
  action,
  confidence,
  stopLossPips,
  takeProfitPips,
  rationale,
  riskFactors = [],
  lastExecutionId,
}: SignalPanelProps) => (
  <Card>
    <CardHeader
      title="Gemini Signal"
      description={`AI-backed recommendation for ${symbol} (${timeframe}).`}
      actions={
        confidence ? (
          <Badge variant="warning">
            Confidence: {confidence.toFixed(2)}
          </Badge>
        ) : null
      }
    />
    <CardContent className="space-y-6">
      <div>
        <p className={`text-4xl font-semibold ${actionColor(action)}`}>
          {action ? action.toUpperCase() : "Awaiting signal"}
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {rationale ?? "Run the AI analysis to get the next recommendation."}
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">
            Stop Loss
          </dt>
          <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {stopLossPips ? `${stopLossPips} pips` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">
            Take Profit
          </dt>
          <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {takeProfitPips ? `${takeProfitPips} pips` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">
            Last Trade ID
          </dt>
          <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {lastExecutionId ?? "—"}
          </dd>
        </div>
      </dl>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Risk Factors
        </h3>
        {riskFactors.length === 0 ? (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gemini did not highlight any specific risks.
          </p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {riskFactors.map((factor) => (
              <li key={factor} className="flex items-start gap-2">
                <span aria-hidden>•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardContent>
  </Card>
);
