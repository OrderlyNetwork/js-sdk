import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";
import { ConfigStore, type ConfigKey } from "@orderly.network/core";

export function useConfig<K extends ConfigKey | undefined, T>(
  key?: K,
  defaultValue?: T
): undefined extends K
  ? ConfigStore
  : undefined extends T
  ? any
  : T extends infer R
  ? R
  : never {
  const { configStore } = useContext(OrderlyContext);

  if (typeof key !== "undefined") {
    if (typeof defaultValue !== "undefined") {
      // TODO fix type guard
      return configStore.getOr(key, defaultValue) as any;
    }
    return configStore.get(key);
  }

  // TODO fix type guard
  return configStore as any;
}
