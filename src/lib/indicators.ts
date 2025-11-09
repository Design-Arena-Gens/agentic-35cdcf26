import type { Candle } from "@/lib/market-data";

const calcSma = (values: number[], length: number): number => {
  if (values.length < length) return 0;
  const slice = values.slice(-length);
  const sum = slice.reduce((acc, value) => acc + value, 0);
  return sum / length;
};

const calcEma = (values: number[], length: number): number => {
  if (values.length < length) return 0;
  const smoothing = 2 / (length + 1);
  let ema = calcSma(values.slice(0, length), length);

  for (let i = length; i < values.length; i += 1) {
    ema = values[i] * smoothing + ema * (1 - smoothing);
  }

  return ema;
};

const calcRsi = (values: number[], period = 14): number => {
  if (values.length <= period) return 0;

  let gains = 0;
  let losses = 0;

  for (let i = values.length - period; i < values.length; i += 1) {
    const delta = values[i] - values[i - 1];
    if (delta > 0) gains += delta;
    else losses -= delta;
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
};

const calcAtr = (candles: Candle[], period = 14): number => {
  if (candles.length <= period) return 0;

  const trs: number[] = [];
  for (let i = candles.length - period; i < candles.length; i += 1) {
    const current = candles[i];
    const prev = candles[i - 1];
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prev.close),
      Math.abs(current.low - prev.close),
    );
    trs.push(tr);
  }

  return trs.reduce((acc, value) => acc + value, 0) / trs.length;
};

export const buildIndicatorSnapshot = (candles: Candle[]) => {
  const closes = candles.map((candle) => candle.close);
  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);

  return {
    sma20: calcSma(closes, 20),
    sma50: calcSma(closes, 50),
    ema12: calcEma(closes, 12),
    ema26: calcEma(closes, 26),
    rsi14: calcRsi(closes, 14),
    atr14: calcAtr(candles, 14),
    maxHigh: Math.max(...highs.slice(-20)),
    minLow: Math.min(...lows.slice(-20)),
  };
};
