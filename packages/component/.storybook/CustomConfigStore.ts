import { ConfigKey, ConfigStore } from "@orderly.network/core";

type ENV_NAME = "prod" | "staging" | "qa" | "dev";

type URLS = {
  apiBaseUrl: string;
  publicWsUrl: string;
  privateWsUrl: string;
  operatorUrl: string;
};

const API_URLS: Record<ENV_NAME, URLS> = {
  prod: {
    apiBaseUrl: "https://api.orderly.org",
    publicWsUrl: "wss://ws-evm.orderly.org",
    privateWsUrl: "wss://ws-private-evm.orderly.org",
    operatorUrl: "https://operator-evm.orderly.org",
  },
  staging: {
    apiBaseUrl: "https://testnet-api.orderly.org",
    publicWsUrl: "wss://testnet-ws-evm.orderly.org",
    privateWsUrl: "wss://testnet-ws-private-evm.orderly.org",
    operatorUrl: "https://testnet-operator-evm.orderly.org",
  },
  dev: {
    apiBaseUrl: "https://dev-api-iap-v2.orderly.org",
    publicWsUrl: "wss://dev-ws-v2.orderly.org",
    privateWsUrl: "wss://dev-ws-private-v2.orderly.org",
    operatorUrl: "https://dev-operator-v2.orderly.network",
  },
  qa: {
    apiBaseUrl: "https://qa-api-evm.orderly.org",
    publicWsUrl: "wss://qa-ws-evm.orderly.org",
    privateWsUrl: "wss://qa-ws-private-evm.orderly.org",
    operatorUrl: "https://qa-operator-evm.orderly.network",
  },
};

const Markets_key = "markets";

export class CustomConfigStore implements ConfigStore {
  protected map: Map<ConfigKey, any>;

  constructor(init: Partial<Record<ConfigKey, any>>) {
    const networkId = init?.networkId || "mainnet";
    const env = (init?.env as ENV_NAME) || "prod";
    const urls = API_URLS[env];

    this.map = new Map<ConfigKey, any>([
      ["brokerId", "orderly"],
      ["env", env],
      ["apiBaseUrl", urls["apiBaseUrl"]],
      ["publicWsUrl", urls["publicWsUrl"]],
      ["privateWsUrl", urls["privateWsUrl"]],
      ["operatorUrl", urls["operatorUrl"]],
      ["networkId", networkId],
    ]);
  }
  get<T>(key: ConfigKey): T {
    if (key === Markets_key) {
      const jsonStr = localStorage.getItem(Markets_key);
      if (jsonStr) {
        this.map.set(Markets_key, JSON.parse(jsonStr));
      } else {
        const defaultTab = { name: "Popular", id: 1 };
        this.set(Markets_key, {
          recent: [],
          favorites: [
            { name: "PERP_ETH_USDC", tabs: [{ ...defaultTab }] },
            { name: "PERP_BTC_USDC", tabs: [{ ...defaultTab }] },
          ],
          favoriteTabs: [{ ...defaultTab }],
        });
      }
    }
    return this.map.get(key);
  }
  getOr<T>(key: ConfigKey, defaultValue: T): T {
    return this.map.get(key) ?? defaultValue;
  }
  set<T>(key: ConfigKey, value: T): void {
    if (key === Markets_key) {
      const jsonStr = JSON.stringify(value);
      localStorage.setItem(Markets_key, jsonStr);
  }
    this.map.set(key, value);
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}
