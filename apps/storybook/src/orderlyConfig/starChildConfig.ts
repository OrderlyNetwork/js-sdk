import type { StarchildProviderConfig } from "@orderly.network/ui-starchild-widget";

const TELEGRAM_BOT_IDS = {
  woofi: "7989045229",
  woofiPro: "8354814497",
  test: "7573076643",
} as const;

export const starchildProviderConfig: StarchildProviderConfig = {
  enable: true,
  getBotId: (env) =>
    env === "prod" ? TELEGRAM_BOT_IDS.woofiPro : TELEGRAM_BOT_IDS.test,
};
