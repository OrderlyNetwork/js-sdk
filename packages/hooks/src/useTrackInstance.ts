import { useContext } from "react";
import useConstant from "use-constant";
import { SimpleDI } from "@orderly.network/core";
import { OrderlyContext } from "./orderlyContext";
import { ENVType, AmplitudeTracker } from "./services/amplitudeTracker";

export const useTrackingInstance = () => {
  const { configStore, amplitudeConfig } = useContext(OrderlyContext);

  if (!configStore) {
    throw new Error("configStore is not defined, please use OrderlyProvider");
  }

  const env = configStore.get("env") as ENVType;
  const brokerId = configStore.get("brokerId") as string;

  const trackInstace = useConstant(() => {
    let instance = SimpleDI.get<AmplitudeTracker>("amplitudeTracker");
    if (!instance) {
      instance = new AmplitudeTracker(env, amplitudeConfig ?? undefined, {
        brokerId,
        sdk_version:
          window?.__ORDERLY_VERSION__?.["@orderly.network/net"] ?? "",
      });

      SimpleDI.registerByName("instance", instance);
    }
    return instance;
  });

  return trackInstace;
};
