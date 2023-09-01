export interface ConfigStore {
  get<T>(key: string): T;
  set<T>(key: string, value: T): void;
  clear(): void;
}

export class MemoryConfigStore implements ConfigStore {
  private map!: Map<string, any>;

  constructor() {
    this._restore();
  }

  private _restore() {
    this.map = new Map([
      ["apiBaseUrl", "https://dev-api-v2.orderly.org/v1"],
      ["klineDataUrl", "https://dev-api-v2.orderly.org"],
    ]);
  }

  get<T>(key: string): T {
    return this.map.get(key);
  }

  set<T>(key: string, value: T): void {
    this.map.set(key, value);
  }

  clear(): void {}
}

// export const memoryConfigStoreInstance = new MemoryConfigStore();
