import React, { PropsWithChildren, useEffect, useState } from "react";
import { useSimpleDI } from "@orderly.network/hooks";
import type { InitOptions, OnboardAPI } from "@web3-onboard/core";
import { Optional } from "@orderly.network/types";
import { initConfig } from "./config";


export type ConnectorInitOptions = Optional<
  InitOptions,
  | "apiKey"
  | "connect"
  | "wallets"
  | "chains"
  | "appMetadata"
  | "accountCenter"
  | "theme"
>;

export interface WalletConnectorProviderProps {
  apiKey?: string;
  options?: ConnectorInitOptions;
  // skip board configuration if already initialized
  skipInit?: boolean;
}

export function InitEvm(
  props: PropsWithChildren<WalletConnectorProviderProps>
) {
  const [initialized, setInitialized] = useState(!!props.skipInit);

  const { get, register } = useSimpleDI();

  useEffect(() => {
    document.body.style.setProperty("--onboard-modal-z-index", "88");
  }, []);

  useEffect(() => {
    if (props.skipInit) {
      return;
    }

    let onboardAPI = get("onboardAPI") as OnboardAPI;

    if (onboardAPI) {
      console.log("[Orderly SDK]:onboardAPI already initialized");
      setInitialized(true);
      return;
    }

    onboardAPI = initConfig(props.apiKey, props.options as InitOptions);
    register("onboardAPI", onboardAPI);
    setInitialized(true);
  }, []);

  if (!initialized) return null;

  return props.children
}
