import { z } from "zod";

const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  METAAPI_TOKEN: z.string().min(1, "METAAPI_TOKEN is required"),
  METAAPI_ACCOUNT_ID: z.string().min(1, "METAAPI_ACCOUNT_ID is required"),
  METAAPI_APPLICATION_ID: z
    .string()
    .min(1, "METAAPI_APPLICATION_ID is required")
    .default("auto-trading-app"),
  FOREX_DATA_PROVIDER: z
    .enum(["alphavantage", "twelve-data"])
    .default("alphavantage"),
  ALPHAVANTAGE_API_KEY: z
    .string()
    .optional()
    .describe("Required when FOREX_DATA_PROVIDER=alphavantage"),
  TWELVE_DATA_API_KEY: z
    .string()
    .optional()
    .describe("Required when FOREX_DATA_PROVIDER=twelve-data"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export const getServerEnv = (): ServerEnv => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    METAAPI_TOKEN: process.env.METAAPI_TOKEN,
    METAAPI_ACCOUNT_ID: process.env.METAAPI_ACCOUNT_ID,
    METAAPI_APPLICATION_ID:
      process.env.METAAPI_APPLICATION_ID ?? "auto-trading-app",
    FOREX_DATA_PROVIDER:
      (process.env.FOREX_DATA_PROVIDER as "alphavantage" | "twelve-data") ??
      "alphavantage",
    ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY,
    TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ")}`,
    );
  }

  if (
    parsed.data.FOREX_DATA_PROVIDER === "alphavantage" &&
    !parsed.data.ALPHAVANTAGE_API_KEY
  ) {
    throw new Error(
      "ALPHAVANTAGE_API_KEY must be set when FOREX_DATA_PROVIDER is alphavantage",
    );
  }

  if (
    parsed.data.FOREX_DATA_PROVIDER === "twelve-data" &&
    !parsed.data.TWELVE_DATA_API_KEY
  ) {
    throw new Error(
      "TWELVE_DATA_API_KEY must be set when FOREX_DATA_PROVIDER is twelve-data",
    );
  }

  cachedEnv = parsed.data;
  return parsed.data;
};
