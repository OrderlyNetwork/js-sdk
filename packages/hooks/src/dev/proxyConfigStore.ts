import { ConfigKey, ConfigStore } from "@orderly.network/core";
import { SDKError } from "@orderly.network/types";
import { windowGuard } from "@orderly.network/utils";

export class ProxyConfigStore implements ConfigStore {
  private _proxyConfigStore?: ConfigStore;

  constructor(private readonly _originConfigStore: ConfigStore) {
    windowGuard(() => {
      this._proxyConfigStore =
        (window as any).__ORDERLY_CONFIG_STORE__ || _originConfigStore;
    });
  }

  get<T>(key: ConfigKey): T {
    const value = this._proxyConfigStore?.get(key);
    if (typeof value === "undefined") {
      return this._originConfigStore.get(key);
    }
    return value as T;
  }

  getOr<T>(key: ConfigKey, defaultValue: T): T {
    return (this._proxyConfigStore ?? this._originConfigStore).getOr(
      key,
      defaultValue
    );
  }

  set<T>(key: ConfigKey, value: T): void {
    (this._proxyConfigStore ?? this._originConfigStore).set(key, value);
  }

  clear(): void {
    throw new SDKError("Method not implemented.");
  }

  getFromOrigin<T>(key: ConfigKey): T {
    return this._originConfigStore.get(key);
  }

  getOrFromOrigin<T>(key: ConfigKey, defaultValue: T): T {
    return this._originConfigStore.getOr(key, defaultValue);
  }

  setToOrigin<T>(key: ConfigKey, value: T): void {
    this._originConfigStore.set(key, value);
  }

  clearOrigin(): void {
    this._originConfigStore.clear();
  }
}
