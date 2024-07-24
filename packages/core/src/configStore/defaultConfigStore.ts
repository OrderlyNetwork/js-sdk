import { ConfigKey, ConfigStore } from "./configStore";

type ENV_NAME = "prod" | "staging" | "dev";

type URLS = {
  apiBaseUrl: string;
  publicWsUrl: string;
  privateWsUrl: string;
  operatorUrl: string;
};

const API_URLS: { [key: string]: URLS } = {
  mainnet: {
    apiBaseUrl: "https://api-evm.orderly.org",
    publicWsUrl: "wss://ws-evm.orderly.org",
    privateWsUrl: "wss://ws-private-evm.orderly.org",
    operatorUrl: "https://operator-evm.orderly.org",
  },
  testnetbak: {
    apiBaseUrl: "https://testnet-api-evm.orderly.org",
    publicWsUrl: "wss://testnet-ws-evm.orderly.org",
    privateWsUrl: "wss://testnet-ws-private-evm.orderly.org",
    operatorUrl: "https://testnet-operator-evm.orderly.org",
  },
    testnet: {
    apiBaseUrl: "https://dev-api-v2.orderly.org",
    publicWsUrl: "wss://dev-ws-v2.orderly.org",
    privateWsUrl: "wss://dev-ws-private-v2.orderly.org",
    operatorUrl: "https://dev-operator-v2.orderly.network",

    },
};

export class DefaultConfigStore implements ConfigStore {
  protected map: Map<ConfigKey, any>;

  constructor(init: Partial<Record<ConfigKey, any>>) {
    const env = init.env || "prod";
    const networkId = init.networkId || "mainnet";
    const urls = API_URLS[networkId];

    this.map = new Map<ConfigKey, any>([
      ["brokerId", init.brokerId],
      ['brokerName', init.brokerName ?? 'Orderly network'],
      ["env", env],
      ["apiBaseUrl", urls["apiBaseUrl"]],
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
