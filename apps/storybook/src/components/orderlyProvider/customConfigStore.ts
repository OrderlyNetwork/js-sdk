import { API_URLS, ConfigKey, type URLS } from "@kodiak-finance/orderly-core";
import { ExtendedConfigStore } from "@kodiak-finance/orderly-hooks";

type ENV_NAME = "prod" | "staging" | "qa" | "dev";

const APIS: Record<ENV_NAME, URLS> = {
  prod: API_URLS.mainnet,
  staging: API_URLS.testnet,
  dev: {
    apiBaseUrl: "https://dev-api-aliyun.orderly.org",
    publicWsUrl: "wss://dev-ws-aliyun.orderly.org",
    privateWsUrl: "wss://dev-ws-private-aliyun.orderly.org",
    operatorUrl: {
      EVM: "https://dev-operator-aliyun.orderly.network",
      SOL: "https://dev-sol-operator-aliyun.orderly.network",
    },
  },
  qa: {
    apiBaseUrl: "https://qa-api-aliyun.orderly.org",
    publicWsUrl: "wss://qa-ws-aliyun.orderly.org",
    privateWsUrl: "wss://qa-ws-private-aliyun.orderly.org",
    operatorUrl: {
      EVM: "https://qa-operator-aliyun.orderly.network",
      SOL: "https://qa-sol-operator-aliyun.orderly.network",
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
