import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";
import { ConfigStore, type ConfigKey } from "@orderly.network/core";
import { SDKError } from "@orderly.network/types";

export function useConfig(): ConfigStore;
export function useConfig<T = string>(key: ConfigKey, defaultValue?: T): T;

export function useConfig(key?: ConfigKey, defaultValue?: any) {
  const { configStore } = useContext(OrderlyContext);

  if (!configStore) {
    throw new SDKError(
      "useConfig must be used within OrderlyConfigProvider or OrderlyAppProvider"
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
