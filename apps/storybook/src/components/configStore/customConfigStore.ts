import { ConfigKey, API_URLS, type URLS } from "@orderly.network/core";
import { ExtendedConfigStore } from "@orderly.network/hooks";

type ENV_NAME = "prod" | "staging" | "qa" | "dev";

const APIS: Record<ENV_NAME, URLS> = {
  prod: API_URLS.mainnet,
  staging: API_URLS.testnet,
  dev: {
    apiBaseUrl: "https://dev-api.orderly.org",
    publicWsUrl: "wss://dev-ws-v2.orderly.org",
    privateWsUrl: "wss://dev-ws-private-v2.orderly.org",
    operatorUrl: {
      EVM: "https://dev-operator-v2.orderly.network",
      SOL: "https://qa-sol-operator.orderly.network",
    },
  },
  qa: {
    apiBaseUrl: "https://qa-api.orderly.org",
    publicWsUrl: "wss://qa-ws-evm.orderly.org",
    privateWsUrl: "wss://qa-ws-private-evm.orderly.org",
    operatorUrl: {
      EVM: "https://qa-operator-evm.orderly.network",
      SOL: "https://qa-sol-operator.orderly.network",
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
