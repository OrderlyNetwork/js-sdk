import React, { PropsWithChildren, useEffect, useState } from "react";
import { Optional } from "@orderly.network/types";

import type { InitOptions } from "@web3-onboard/core";
import { initConfig } from "./config";
import { Main } from "./main";

export interface WalletConnectorProviderProps {
  apiKey?: string;
  options?: ConnectorInitOptions;
  // skip board configuration if already initialized
  skipInit?: boolean;
}

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

export const ConnectorProvider = (
  props: PropsWithChildren<WalletConnectorProviderProps>
) => {
  const [initialized, setInitialized] = useState(!!props.skipInit);

  useEffect(() => {
    document.body.style.setProperty("--onboard-modal-z-index", "88");
  }, []);

  useEffect(() => {
    if (props.skipInit) {
      return;
    }
    initConfig(props.apiKey, props.options as InitOptions);
    setInitialized(true);
  }, []);

  if (!initialized) return null;

  return <Main>{props.children}</Main>;
};
