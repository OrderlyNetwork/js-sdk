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
