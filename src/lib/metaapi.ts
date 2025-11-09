import type {
  MetatraderAccount,
  MetatraderPosition,
  MetatraderSymbolSpecification,
  RpcMetaApiConnectionInstance,
} from "metaapi.cloud-sdk";
import { getServerEnv } from "@/lib/env";

export type TradeAction = "buy" | "sell";

export type TradeRequest = {
  symbol: string;
  action: TradeAction;
  lotSize: number;
  stopLossPips: number;
  takeProfitPips: number;
  magicNumber: number;
  comment?: string;
};

export type AccountSnapshot = {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  currency: string;
};

export type PositionSnapshot = {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  volume: number;
  price: number;
  profit: number;
  unrealizedProfit: number;
  comment?: string;
};

type MetaApiClass = typeof import("metaapi.cloud-sdk").default;
type MetaApiInstance = InstanceType<MetaApiClass>;

let metaApiCtor: MetaApiClass | null = null;
let metaApiClient: MetaApiInstance | null = null;
let accountCache: MetatraderAccount | null = null;
let rpcConnectionPromise: Promise<RpcMetaApiConnectionInstance> | null = null;

const ensureMetaApiClient = async (): Promise<MetaApiInstance> => {
  if (!metaApiClient) {
    const env = getServerEnv();
    if (!metaApiCtor) {
      const module = await import("metaapi.cloud-sdk");
      metaApiCtor = module.default;
    }

    metaApiClient = new metaApiCtor(env.METAAPI_TOKEN, {
      application: env.METAAPI_APPLICATION_ID,
    });
  }

  return metaApiClient;
};

const getAccount = async (): Promise<MetatraderAccount> => {
  if (accountCache) return accountCache;

  const env = getServerEnv();
  const client = await ensureMetaApiClient();
  accountCache = await client.metatraderAccountApi.getAccount(
    env.METAAPI_ACCOUNT_ID,
  );

  if (accountCache.state !== "DEPLOYED") {
    await accountCache.deploy();
  }

  return accountCache;
};

const waitForDeployment = async (account: MetatraderAccount) => {
  const waitTimeoutMs = 60_000;
  const start = Date.now();
  while (account.state !== "DEPLOYED") {
    if (Date.now() - start > waitTimeoutMs) {
      throw new Error("MetaApi account failed to deploy within timeout");
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await account.reload();
  }
};

const getRpcConnection = async (): Promise<RpcMetaApiConnectionInstance> => {
  if (rpcConnectionPromise) return rpcConnectionPromise;

  rpcConnectionPromise = (async () => {
    const account = await getAccount();
    await waitForDeployment(account);

    const connection = account.getRPCConnection();
    await connection.connect();
    await connection.waitSynchronized();

    return connection;
  })();

  return rpcConnectionPromise;
};

export const getAccountSnapshot = async (): Promise<AccountSnapshot> => {
  const connection = await getRpcConnection();
  const state = await connection.getAccountInformation();

  return {
    balance: state.balance,
    equity: state.equity,
    margin: state.margin,
    freeMargin: state.freeMargin,
    leverage: state.leverage,
    currency: state.currency,
  };
};

export const getOpenPositions = async (): Promise<PositionSnapshot[]> => {
  const connection = await getRpcConnection();
  const positions = await connection.getPositions();

  return positions.map((position: MetatraderPosition) => ({
    id: String(position.id),
    symbol: position.symbol,
    type: position.type === "POSITION_TYPE_BUY" ? "buy" : "sell",
    volume: position.volume,
    price: position.currentPrice ?? position.openPrice,
    profit: position.profit ?? 0,
    unrealizedProfit: position.unrealizedProfit ?? 0,
    comment: position.comment ?? undefined,
  }));
};

const getSymbolSpecification = async (
  symbol: string,
): Promise<MetatraderSymbolSpecification> => {
  const connection = await getRpcConnection();
  const specification = await connection.getSymbolSpecification(symbol);
  if (!specification) {
    throw new Error(`Unable to load specification for symbol ${symbol}`);
  }

  return specification;
};

export const calculateLotSize = async (
  symbol: string,
  riskPercent: number,
  stopLossPips: number,
): Promise<number> => {
  const [account, specification] = await Promise.all([
    getAccountSnapshot(),
    getSymbolSpecification(symbol),
  ]);

  const riskAmount = (account.balance * riskPercent) / 100;
  const pipValue =
    (specification.contractSize ?? 100_000) *
    (specification.point ?? Math.pow(10, -(specification.digits ?? 4)));
  const rawVolume = riskAmount / (stopLossPips * pipValue);

  const minVolume = specification.minVolume ?? 0.01;
  const volumeStep = specification.volumeStep ?? 0.01;
  const adjusted =
    Math.max(minVolume, Math.floor(rawVolume / volumeStep) * volumeStep);

  return Number(adjusted.toFixed(2));
};

export const executeTrade = async (request: TradeRequest) => {
  const connection = await getRpcConnection();
  const specification = await getSymbolSpecification(request.symbol);
  const { bid, ask } = await connection.getSymbolPrice(request.symbol, false);
  const price = request.action === "buy" ? ask : bid;

  const stopLoss =
    request.action === "buy"
      ? price - request.stopLossPips * specification.point
      : price + request.stopLossPips * specification.point;

  const takeProfit =
    request.action === "buy"
      ? price + request.takeProfitPips * specification.point
      : price - request.takeProfitPips * specification.point;

  const tradeOptions = {
    magic: request.magicNumber,
    comment: request.comment ?? "Gemini AI trade",
    slippage: 10,
  };

  const result =
    request.action === "buy"
      ? await connection.createMarketBuyOrder(
          request.symbol,
          request.lotSize,
          stopLoss,
          takeProfit,
          tradeOptions,
        )
      : await connection.createMarketSellOrder(
          request.symbol,
          request.lotSize,
          stopLoss,
          takeProfit,
          tradeOptions,
        );

  const successfulCodes = new Set([0, 10008, 10009, 10010, 10025]);
  if (!successfulCodes.has(result.numericCode)) {
    throw new Error(`Trade failed (${result.stringCode}): ${result.message}`);
  }

  return result;
};
