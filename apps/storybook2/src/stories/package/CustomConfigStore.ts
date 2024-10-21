import { ConfigKey, ConfigStore } from "@orderly.network/core";
import { MarketsStorageKey } from "@orderly.network/hooks";

type ENV_NAME = "prod" | "staging" | "qa" | "dev";

type URLS = {
  apiBaseUrl: string;
  publicWsUrl: string;
  privateWsUrl: string;
  operatorUrl: string;
};

const API_URLS: Record<ENV_NAME, URLS> = {
  prod: {
    apiBaseUrl: "https://api-evm.orderly.org",
    publicWsUrl: "wss://ws-evm.orderly.org",
    privateWsUrl: "wss://ws-private-evm.orderly.org",
    operatorUrl: "https://operator-evm.orderly.org",
  },
  staging: {
    apiBaseUrl: "https://testnet-api-evm.orderly.org",
    publicWsUrl: "wss://testnet-ws-evm.orderly.org",
    privateWsUrl: "wss://testnet-ws-private-evm.orderly.org",
    operatorUrl: "https://testnet-operator-evm.orderly.org",
  },
  dev: {
    apiBaseUrl: "https://dev-api-v2.orderly.org",
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

export class CustomConfigStore implements ConfigStore {
  protected map: Map<ConfigKey, any>;

  constructor(init: Partial<Record<ConfigKey, any>>) {
    const networkId = init?.networkId || "mainnet";
    const brokerId = init?.brokerId || "orderly";
    const brokerName = init?.brokerName || "Orderly";
    const env = (init?.env as ENV_NAME) || "prod";
    const urls = API_URLS[env];

    this.map = new Map<ConfigKey, any>([
      ["brokerId", brokerId],
      ["brokerName", brokerName],
      ["env", env],
      ["apiBaseUrl", urls["apiBaseUrl"]],
      ["publicWsUrl", urls["publicWsUrl"]],
      ["privateWsUrl", urls["privateWsUrl"]],
      ["operatorUrl", urls["operatorUrl"]],
      ["networkId", networkId],
    ]);
  }
  get<T>(key: ConfigKey): T {
    if (key === MarketsStorageKey) {
      const jsonStr = localStorage.getItem(MarketsStorageKey);
      return jsonStr ? JSON.parse(jsonStr) : "";
    }
    return this.map.get(key);
  }
  getOr<T>(key: ConfigKey, defaultValue: T): T {
    return this.map.get(key) ?? defaultValue;
  }
  set<T>(key: ConfigKey, value: T): void {
    if (key === MarketsStorageKey) {
      const jsonStr = JSON.stringify(value);
      localStorage.setItem(MarketsStorageKey, jsonStr);
      return;
    }
    this.map.set(key, value);
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}
