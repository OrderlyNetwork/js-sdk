import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";
import { ConfigStore, type ConfigKey } from "@orderly.network/core";

export const useConfig = <T>(
  key?: ConfigKey,
  defaultValue?: T
): T | ConfigStore => {
  const { configStore } = useContext(OrderlyContext);

  //

  if (typeof key !== "undefined") {
    if (typeof defaultValue !== "undefined") {
      return configStore.getOr(key, defaultValue);
    }
    return configStore.get(key);
  }

  return configStore;
};
