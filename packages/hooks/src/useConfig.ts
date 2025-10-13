import { useContext } from "react";
import { ConfigStore, type ConfigKey } from "@kodiak-finance/orderly-core";
import { SDKError } from "@kodiak-finance/orderly-types";
import { OrderlyContext } from "./orderlyContext";

export function useConfig(): ConfigStore;
export function useConfig<T = string>(key: ConfigKey, defaultValue?: T): T;

export function useConfig(key?: ConfigKey, defaultValue?: any) {
  const { configStore } = useContext(OrderlyContext);

  if (!configStore) {
    throw new SDKError(
      "useConfig must be used within OrderlyConfigProvider or OrderlyAppProvider",
    );
  }

  if (typeof key !== "undefined") {
    if (typeof defaultValue !== "undefined") {
      return configStore.getOr(key, defaultValue) as any;
    }
    return configStore.get(key);
  }

  return configStore;
}
