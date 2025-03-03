import useConstant from "use-constant";
import { useContext } from "react";
import { AmplitudeTracker } from "@orderly.network/core";
import { SimpleDI } from "@orderly.network/core";
import { OrderlyContext } from "./orderlyContext";
import { ENVType } from "@orderly.network/core";
export const useTrackingInstance = () => {

  const { configStore } = useContext(OrderlyContext);

  if (!configStore)
    throw new Error("configStore is not defined, please use OrderlyProvider");

  const env = configStore.get('env') as ENVType;
  const brokerId = configStore.get('brokerId') as string;

  const trackInstace = useConstant(() => {
    let instance = SimpleDI.get<AmplitudeTracker>("amplitudeTracker");
    if (!instance) {
      instance = new AmplitudeTracker(env, {
        brokerId,
        sdk_version: window?.__ORDERLY_VERSION__?.["@orderly.network/net"] ?? "",
      });

      SimpleDI.registerByName("instance", instance);
    }
    return instance;
  });

  return trackInstace;
};
