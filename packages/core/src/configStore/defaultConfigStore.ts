import { ConfigKey, ConfigStore } from "./configStore";

type ENV_NAME = "prod" | "staging" | "dev";

type URLS = {
  apiBaseUrl: string;
  klineDataUrl: string;
  publicWsUrl: string;
  privateWsUrl: string;
  operatorUrl: string;
  // swapSupportApiUrl: string;
};

const API_URLS: { [key: string]: URLS } = {
  prod: {
    apiBaseUrl: "https://api-evm.orderly.org",
    klineDataUrl: "https://api-evm.orderly.org",
    publicWsUrl: "wss://ws-evm.orderly.org",
    privateWsUrl: "wss://ws-private-evm.orderly.org",
    operatorUrl: "https://testnet-operator-evm.orderly.org",
  },
  staging: {
    apiBaseUrl: "https://testnet-api-evm.orderly.org",
    klineDataUrl: "https://testnet-api-evm.orderly.org",
    publicWsUrl: "wss://testnet-ws-evm.orderly.org",
    privateWsUrl: "wss://testnet-ws-private-evm.orderly.org",
    operatorUrl: "https://testnet-operator-evm.orderly.org",
  },
  //   dev: {},
};

export class DefaultConfigStore implements ConfigStore {
  protected map: Map<ConfigKey, any>;

  constructor(init: Record<ConfigKey, any>) {
    const env = init.env || "prod";
    const urls = API_URLS[env];
    const networkId = init.networkId || "mainnet";

    this.map = new Map<ConfigKey, any>([
      ["brokerId", init.brokerId],
      ["env", env],
      ["apiBaseUrl", urls["apiBaseUrl"]],
      ["klineDataUrl", urls["klineDataUrl"]],
      ["publicWsUrl", urls["publicWsUrl"]],
      ["privateWsUrl", urls["privateWsUrl"]],
      ["operatorUrl", urls["operatorUrl"]],
      ["networkId", networkId],
    ]);
  }
  get<T>(key: ConfigKey): T {
    return this.map.get(key);
  }
  getOr<T>(key: ConfigKey, defaultValue: T): T {
    return this.map.get(key) ?? defaultValue;
  }
  set<T>(key: ConfigKey, value: T): void {
    this.map.set(key, value);
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}
