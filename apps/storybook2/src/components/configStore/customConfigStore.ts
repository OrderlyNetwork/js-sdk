import {
  ConfigKey,
  API_URLS,
  type URLS,
  DefaultConfigStore,
} from "@orderly.network/core";
import { MarketsStorageKey } from "@orderly.network/hooks";

type ENV_NAME = "prod" | "staging" | "qa" | "dev";

const APIS: Record<ENV_NAME, URLS> = {
  prod: API_URLS.mainnet,
  staging: API_URLS.testnet,
  dev: {
    apiBaseUrl: "https://dev-api-v2.orderly.org",
    publicWsUrl: "wss://dev-ws-v2.orderly.org",
    privateWsUrl: "wss://dev-ws-private-v2.orderly.org",
    operatorUrl: {
      evm: "https://dev-operator-v2.orderly.network",
      // todo dev solana faucet url is not given
      solana: "https://qa-sol-operator.orderly.network",
    },
  },
  qa: {
    apiBaseUrl: "https://qa-api-evm.orderly.org",
    publicWsUrl: "wss://qa-ws-evm.orderly.org",
    privateWsUrl: "wss://qa-ws-private-evm.orderly.org",
    operatorUrl: {
      evm: "https://qa-operator-evm.orderly.network",
      solana: "https://qa-sol-operator.orderly.network",
    },
  },
};

export class CustomConfigStore extends DefaultConfigStore {
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

  get<T>(key: ConfigKey): T {
    if (key === MarketsStorageKey) {
      const jsonStr = localStorage.getItem(MarketsStorageKey);
      if (!jsonStr) {
        // get old storage key data
        const oldJsonStr = localStorage.getItem(
          MarketsStorageKey.replace("orderly_", "")
        );
        return oldJsonStr ? JSON.parse(oldJsonStr) : ("" as T);
      }

      return JSON.parse(jsonStr);
    }
    return super.get(key);
  }

  set<T>(key: ConfigKey, value: T): void {
    if (key === MarketsStorageKey) {
      const jsonStr = JSON.stringify(value);
      localStorage.setItem(MarketsStorageKey, jsonStr);
      return;
    }
    super.set(key, value);
  }
}
