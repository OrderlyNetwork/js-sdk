import { ConfigKey, API_URLS, type URLS } from "@orderly.network/core";
import { ExtendedConfigStore } from "@orderly.network/hooks";

type ENV_NAME = "prod" | "staging" | "qa" | "dev";
const APIS: Record<ENV_NAME, URLS> = {
  prod: API_URLS.mainnet,
  staging: API_URLS.testnet,
  dev: {
    apiBaseUrl: "https://api.dev.orderly-i.network",
    publicWsUrl: "wss://ws.dev.orderly-i.network",
    privateWsUrl: "wss://ws-private.dev.orderly-i.network",
    operatorUrl: {
      EVM: "https://operator.dev.orderly-i.network",
      SOL: "https://sol-operator.dev.orderly-i.network",
    },
  },
  qa: {
    apiBaseUrl: "https://api.qa.orderly-i.network",
    publicWsUrl: "wss://ws.qa.orderly-i.network",
    privateWsUrl: "wss://ws-private.qa.orderly-i.network",
    operatorUrl: {
      EVM: "https://operator.qa.orderly-i.network",
      SOL: "https://sol-operator.qa.orderly-i.network",
    },
  },
};

export class CustomConfigStore extends ExtendedConfigStore {
  constructor(init: Partial<Record<ConfigKey, any>>) {
    super(init);
    const env = (init?.env as ENV_NAME) || "prod";
    const urls = APIS[env];

    const entries = [
      ["env", env],
      ["apiBaseUrl", urls["apiBaseUrl"]],
      ["publicWsUrl", urls["publicWsUrl"]],
      ["privateWsUrl", urls["privateWsUrl"]],
      ["operatorUrl", urls["operatorUrl"]],
    ] as [ConfigKey, any][];

    for (const [key, value] of entries) {
      this.map.set(key, value);
    }
  }
}
