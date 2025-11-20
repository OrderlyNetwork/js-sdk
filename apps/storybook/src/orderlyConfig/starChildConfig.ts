import type { ConfigStore } from "@orderly.network/core";
import type { OrderlyAppProviderProps } from "@orderly.network/react-app";

enum TelegramBotId {
  Woofi = "7989045229", // for woofi.com
  WoofiPro = "8354814497", // for pro.woofi.com
  Test = "7573076643", // for testnet
}

export const getStarChildConfig = (
  configStore: ConfigStore,
): OrderlyAppProviderProps["starChildConfig"] => {
  const appEnv = configStore.get("env") as string;
  const isProduction = appEnv === "prod";

  const enable = true;
  if (isProduction) {
    return {
      enable,
      env: "mainnet",
      telegram_bot_id: TelegramBotId.WoofiPro,
    };
  } else {
    return {
      enable,
      env: "testnet",
      telegram_bot_id: TelegramBotId.Test,
    };
  }
};
