import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AccountSummaryProps = {
  balance?: number;
  equity?: number;
  margin?: number;
  freeMargin?: number;
  currency?: string;
  leverage?: number;
  confidence?: number;
  signalAction?: "buy" | "sell" | "hold";
  signalRationale?: string;
};

const formatCurrency = (value?: number, currency = "USD") => {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

const confidenceDescriptor = (confidence?: number) => {
  if (confidence === undefined) return "No signal yet";
  if (confidence >= 0.75) return "High conviction";
  if (confidence >= 0.55) return "Moderate conviction";
  return "Low conviction";
};

const actionBadgeVariant = (action?: "buy" | "sell" | "hold") => {
  if (action === "buy") return "success";
  if (action === "sell") return "danger";
  return "neutral";
};

export const AccountSummary = ({
  balance,
  equity,
  margin,
  freeMargin,
  currency,
  leverage,
  confidence,
  signalAction,
  signalRationale,
}: AccountSummaryProps) => (
  <Card>
    <CardHeader
      title="Account Overview"
      description="Live snapshot of your MetaTrader 5 account state."
    />
    <CardContent>
      <dl className="grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Balance</dt>
          <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(balance, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Equity</dt>
          <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(equity, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">
            Free Margin
          </dt>
          <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(freeMargin, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Margin</dt>
          <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(margin, currency)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Badge variant="neutral">
          Leverage: {leverage ? `${leverage}:1` : "—"}
        </Badge>
        <Badge variant={actionBadgeVariant(signalAction)}>
          Signal: {signalAction ?? "—"}
        </Badge>
        <Badge variant="warning">
          Confidence: {confidence ? confidence.toFixed(2) : "—"} (
          {confidenceDescriptor(confidence)})
        </Badge>
      </div>

      {signalRationale ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {signalRationale}
        </p>
      ) : null}
    </CardContent>
  </Card>
);
