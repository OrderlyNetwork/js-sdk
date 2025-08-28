import { useMemo } from "react";
import { CustomConfigStore } from "./customConfigStore";

const {
  VITE_NETWORK_ID,
  VITE_BROKER_ID,
  VITE_BROKER_NAME,
  VITE_AMPLITUDE_ID,
  VITE_ENV,
} = import.meta.env || {};

export type ConfigStoreOptions = {
  networkId?: string;
  brokerId?: string;
  brokerName?: string;
  env?: string;
  amplitudeId?: string;
};

export const useConfigStore = (params: ConfigStoreOptions) => {
  const { networkId, brokerId, brokerName, env, amplitudeId } = params;

  const configStore = useMemo(() => {
    return new CustomConfigStore({
      networkId: networkId || VITE_NETWORK_ID || "testnet",
      brokerId: brokerId || VITE_BROKER_ID || "demo",
      brokerName: brokerName || VITE_BROKER_NAME || "Orderly",
      env: env || VITE_ENV || "staging",
      amplitudeId: amplitudeId || VITE_AMPLITUDE_ID || "",
    });
  }, [networkId, brokerId, brokerName, env, amplitudeId]);

  return configStore;
};
