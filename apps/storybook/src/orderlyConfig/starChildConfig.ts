import type { ConfigStore } from "@orderly.network/core";
import type { OrderlyAppProviderProps } from "@orderly.network/react-app";

export const getStarChildConfig = (
  configStore: ConfigStore,
): OrderlyAppProviderProps["starChildConfig"] => {
  const appEnv = configStore.get("env") as string;
  const isProduction = appEnv === "prod";

  return {
    enable: false,
    env: isProduction ? "mainnet" : "testnet",
    telegram_bot_id: "7573076643",
  };
};
