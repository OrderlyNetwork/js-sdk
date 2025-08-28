export type ConfigKey =
  | "apiBaseUrl"
  | "klineDataUrl"
  | "privateWsUrl"
  | "publicWsUrl"
  | "operatorUrl"
  | "domain"
  | "brokerId"
  | "brokerName"
  | "networkId"
  | "env"
  | "amplitudeId"
  | "chainNamespace"
  | "PROD_URL"
  | "orderly_markets"
  | "markets";

export interface ConfigStore {
  get<T = string>(key: ConfigKey): T;
  getOr<T = string>(key: ConfigKey, defaultValue: T): T;
  set<T>(key: ConfigKey, value: T): void;
  clear(): void;
}
