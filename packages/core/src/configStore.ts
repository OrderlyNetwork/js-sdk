export type ConfigKey = "apiBaseUrl" | "klineDataUrl";

export interface ConfigStore {
  get<T>(key: string): T;
  getOr<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): void;
  clear(): void;
}

export class MemoryConfigStore implements ConfigStore {
  protected map!: Map<string, any>;

  constructor() {
    this._restore();
  }

  protected _restore() {
    this.map = new Map<string, any>([
      // PROD
      ["apiBaseUrl", "https://api-evm.orderly.org"],
      // ["apiBaseUrl", "https://testnet-api-evm.orderly.org"],
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
      ["swapSupportApiUrl", "https://fi-api.woo.org"],
      [
        "domain",
        {
          testnet: "https://testnet-dex-evm.woo.org",
          mainnet: "https://dex-evm.woo.org",
          dexMainnet: "https://dex.woo.org",
          dexTestnet: "https://testnet-dex.woo.org",
        },
      ],
      ["brokerId", "woofi_pro"],
      ["onlyTestnet", false],
      ["env", "dev-evm"],
      ["PROD_URL", ["dex-iap-evm.woo.org", "dex-evm.woo.org"]],
    ]);
  }

  get<T>(key: string): T {
    return this.map.get(key);
  }

  getOr<T>(key: string, defaultValue: T): T {
    return this.map.get(key) ?? defaultValue;
  }

  set<T>(key: string, value: T): void {
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

  protected _restore() {
    const arr = Object.entries(this.configMap);
    this.map = new Map(arr);
  }
}

// export class DefaultJsonConfigStore extends BaseConfigStore {
//   constructor() {
//     //
//     super(configMap);
//   }
// }
