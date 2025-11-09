import { getServerEnv } from "@/lib/env";

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type AlphaVantageResponse = {
  "Time Series FX (5min)": Record<
    string,
    {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume"?: string;
    }
  >;
};

const fetchFromAlphaVantage = async (
  symbol: string,
  interval: string,
  outputSize: "compact" | "full",
): Promise<Candle[]> => {
  const env = getServerEnv();
  const params = new URLSearchParams({
    function: "FX_INTRADAY",
    from_symbol: symbol.slice(0, 3),
    to_symbol: symbol.slice(3),
    interval,
    outputsize: outputSize,
    apikey: env.ALPHAVANTAGE_API_KEY ?? "",
  });

  const response = await fetch(
    `https://www.alphavantage.co/query?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `AlphaVantage request failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as AlphaVantageResponse;
  const series = data["Time Series FX (5min)"];

  if (!series) {
    throw new Error("Unexpected AlphaVantage payload");
  }

  return Object.entries(series)
    .map(([time, values]) => ({
      time,
      open: Number.parseFloat(values["1. open"]),
      high: Number.parseFloat(values["2. high"]),
      low: Number.parseFloat(values["3. low"]),
      close: Number.parseFloat(values["4. close"]),
      volume: Number.parseFloat(values["5. volume"] ?? "0"),
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};

type TwelveDataResponse = {
  values: {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }[];
};

const fetchFromTwelveData = async (
  symbol: string,
  interval: string,
  outputSize: "compact" | "full",
): Promise<Candle[]> => {
  const env = getServerEnv();
  const params = new URLSearchParams({
    symbol,
    interval,
    apikey: env.TWELVE_DATA_API_KEY ?? "",
    outputsize: outputSize === "full" ? "5000" : "100",
  });

  const response = await fetch(
    `https://api.twelvedata.com/time_series?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`TwelveData request failed with status ${response.status}`);
  }

  const data = (await response.json()) as TwelveDataResponse;

  if (!Array.isArray(data.values)) {
    throw new Error("Unexpected TwelveData payload");
  }

  return data.values
    .map((entry) => ({
      time: entry.datetime,
      open: Number.parseFloat(entry.open),
      high: Number.parseFloat(entry.high),
      low: Number.parseFloat(entry.low),
      close: Number.parseFloat(entry.close),
      volume: Number.parseFloat(entry.volume),
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};

export const fetchForexCandles = async (
  symbol: string,
  interval: string = "5min",
  outputSize: "compact" | "full" = "compact",
): Promise<Candle[]> => {
  const env = getServerEnv();

  if (env.FOREX_DATA_PROVIDER === "alphavantage") {
    return fetchFromAlphaVantage(symbol, interval, outputSize);
  }

  return fetchFromTwelveData(symbol, interval, outputSize);
};
