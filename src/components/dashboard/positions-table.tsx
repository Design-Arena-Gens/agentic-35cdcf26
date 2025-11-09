import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Position = {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  volume: number;
  price: number;
  profit: number;
  unrealizedProfit: number;
  comment?: string;
};

const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

type PositionsTableProps = {
  positions?: Position[];
};

export const PositionsTable = ({ positions = [] }: PositionsTableProps) => (
  <Card className="overflow-hidden">
    <CardHeader
      title="Open Positions"
      description="Active MetaTrader orders under AI management."
    />
    <CardContent className="-mx-6 overflow-x-auto px-0">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50/80 dark:bg-zinc-900/60">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <th className="px-6 py-3">Symbol</th>
            <th className="px-6 py-3">Direction</th>
            <th className="px-6 py-3 text-right">Volume</th>
            <th className="px-6 py-3 text-right">Entry</th>
            <th className="px-6 py-3 text-right">Profit</th>
            <th className="px-6 py-3 text-right">Floating P/L</th>
            <th className="px-6 py-3">Comment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white text-sm dark:divide-zinc-800 dark:bg-zinc-900">
          {positions.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-10 text-center text-zinc-500 dark:text-zinc-400"
              >
                No open positions.
              </td>
            </tr>
          ) : (
            positions.map((position) => (
              <tr key={position.id} className="text-zinc-700 dark:text-zinc-200">
                <td className="px-6 py-4 font-medium">{position.symbol}</td>
                <td className="px-6 py-4">
                  <Badge variant={position.type === "buy" ? "success" : "danger"}>
                    {position.type.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  {formatNumber(position.volume, 2)}
                </td>
                <td className="px-6 py-4 text-right">
                  {formatNumber(position.price, 5)}
                </td>
                <td
                  className={`px-6 py-4 text-right ${
                    position.profit >= 0
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-rose-500 dark:text-rose-300"
                  }`}
                >
                  {formatNumber(position.profit, 2)}
                </td>
                <td
                  className={`px-6 py-4 text-right ${
                    position.unrealizedProfit >= 0
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-rose-500 dark:text-rose-300"
                  }`}
                >
                  {formatNumber(position.unrealizedProfit, 2)}
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  {position.comment ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </CardContent>
  </Card>
);
