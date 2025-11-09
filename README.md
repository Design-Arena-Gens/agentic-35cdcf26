## Gemini FX Autopilot

Autonomous forex trading dashboard coupling Gemini AI intelligence with direct MetaTrader 5 execution via [MetaApi](https://metaapi.cloud/). The web app (Next.js App Router) lets you configure risk tolerances, trigger analyses, review account telemetry, and optionally push trades without manual intervention.

> ⚠️ **Capital at risk** — This software does not guarantee profits, nor does it eliminate market risk. Always validate signals, backtest thoroughly, and monitor live deployments continuously.

---

### Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **UI**: Tailwind CSS 4, bespoke utility components
- **AI**: Gemini 1.5 Flash (`@google/generative-ai`)
- **Trading Bridge**: MetaApi Cloud SDK (MT5)
- **Market Data**: AlphaVantage (default) or Twelve Data

---

### Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and populate the env vars (see below).

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Server-side Gemini API key. Keep private. |
| `METAAPI_TOKEN` | MetaApi management token. |
| `METAAPI_ACCOUNT_ID` | Deployed MetaApi MT5 account ID. |
| `METAAPI_APPLICATION_ID` | Optional MetaApi app label (defaults to `gemini-fx-autopilot`). |
| `FOREX_DATA_PROVIDER` | `alphavantage` (default) or `twelve-data`. |
| `ALPHAVANTAGE_API_KEY` | Required if using AlphaVantage. |
| `TWELVE_DATA_API_KEY` | Required if using Twelve Data. |

Ensure your MetaApi account is in the `DEPLOYED` state with streaming enabled. The backend opens an RPC connection, synchronizes account and position state, and issues market orders with AI-derived stop-loss and take-profit levels.

---

### Core Features

- **Live MT5 Telemetry**: Balance, equity, margin, leverage, and open positions refreshed every 15 seconds.
- **AI Signal Engine**:
  - Fetches recent candles via AlphaVantage/Twelve Data.
  - Builds SMA/EMA/RSI/ATR indicator snapshot.
  - Sends market context + risk profile to Gemini 1.5 Flash.
  - Parses structured AI output (direction, SL/TP, rationale, risks).
- **Risk Controls**:
  - Lot size computed via risk-percentage and stop-loss distance.
  - Max concurrent trades and drawdown thresholds configurable.
- **Execution Control**:
  - Manual review mode to inspect AI proposals.
  - Optional autonomous execution (`autoExecute` flag in `/api/analyze` payload).
- **Automation Ready**: Trigger `/api/analyze` via Vercel Cron or external scheduler for unattended cycles.

---

### Deployment

1. Validate build locally:

   ```bash
   npm run build
   ```

2. Deploy to Vercel (token pre-configured):

   ```bash
   vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-35cdcf26
   ```

3. In Vercel Project Settings → Environment Variables, add the keys listed above (repeat for Preview/Development as needed).

4. (Optional) Create a Vercel Cron targeting `https://agentic-35cdcf26.vercel.app/api/analyze` with a JSON payload mirroring the strategy body.

---

### Extensibility Ideas

- Append custom indicators or price feeds in `src/lib/indicators.ts` and `src/lib/market-data.ts`.
- Adjust Gemini prompt engineering in `src/lib/gemini.ts` for different trading styles.
- Persist trade logs to an external database (Supabase, PlanetScale, etc.) inside API routes.
- Integrate alerting (Slack, Telegram, SMS) when trades execute or thresholds breach.

---

### Disclaimer

Use at your own risk. Forex markets are volatile; slippage, latency, and infrastructure outages can cause unexpected losses. Start on demo accounts, audit AI decisions routinely, and never deploy unattended capital you cannot afford to lose.
