export type ConfigKey =
  | "apiBaseUrl"
  | "klineDataUrl"
  | "privateWsUrl"
  | "publicWsUrl"
  | "operatorUrl"
  | "domain"
  | "brokerId"
  | "networkId"
  | "env"
  | "PROD_URL"
  | "markets";

export interface ConfigStore {
  get<T>(key: ConfigKey): T;
  getOr<T>(key: ConfigKey, defaultValue: T): T;
  set<T>(key: ConfigKey, value: T): void;
  clear(): void;
}

export class MemoryConfigStore implements ConfigStore {
  protected map!: Map<ConfigKey, any>;

  constructor(init?: any) {
    this._restore(init);
  }

  protected _restore(init?: Record<ConfigKey, any>) {
    const brokerId = init?.brokerId || "woofi_pro";
    const networkId = init?.networkId || "mainnet";
    this.map = new Map<ConfigKey, any>([
      // PROD
      // ["apiBaseUrl", "https://api-evm.orderly.org"],
      ["apiBaseUrl", "https://testnet-api-evm.orderly.org"],
      // ["apiBaseUrl", "https://dev-api-iap-v2.orderly.org"],
      ["klineDataUrl", "https://testnet-api-evm.orderly.org"],
      // PROD
      // ["publicWsUrl", "wss://dex-iap-evm.woo.org/ws"],
      ["publicWsUrl", "wss://testnet-ws-evm.orderly.org"],
      // ["publicWsUrl", "wss://dev-ws-v2.orderly.org"],
      // ["publicWebsocketKey", "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY"],
      // ["privateWsUrl", "wss://dev-ws-private-v2.orderly.org"],
      ["privateWsUrl", "wss://testnet-ws-private-evm.orderly.org"],
      // ["privateWsUrl", "wss://dex-iap-evm.woo.org"],
      // ["privateWsUrl", "wss://dex-iap-evm.woo.org/wsprivate"],
      ["operatorUrl", "https://testnet-operator-evm.orderly.org"],
      [
        "domain",
        {
          testnet: "https://testnet-dex-evm.woo.org",
          mainnet: "https://dex-evm.woo.org",
          dexMainnet: "https://dex.woo.org",
          dexTestnet: "https://testnet-dex.woo.org",
        },
      ],
      ["brokerId", brokerId],
      // ["onlyTestnet", false],
      ["env", "dev-evm"],
      ["networkId", networkId],
      ["PROD_URL", ["dex-iap-evm.woo.org", "dex-evm.woo.org"]],
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

  clear(): void {}
}

// export const memoryConfigStoreInstance = new MemoryConfigStore();

/**
 *
 */
export class BaseConfigStore extends MemoryConfigStore {
  constructor(private readonly configMap: Record<string, any>) {
    super();
  }

  // protected _restore() {
  //   const arr = Object.entries(this.configMap);
  //   this.map = new Map(arr);
  // }
}

// export class DefaultJsonConfigStore extends BaseConfigStore {
//   constructor() {
//     //
//     super(configMap);
//   }
// }
