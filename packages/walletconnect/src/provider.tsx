import React, { PropsWithChildren, useEffect, useState } from "react";

import { ConfigOptions, initConfig } from "./config";
import { Main } from "./main";

export interface WalletConnectorProviderProps {
  projectId?: string;
  config?: ConfigOptions;
  // skip board configuration if already initialized
  // skipWagmiInit?: boolean;
}

export const ConnectorProvider = (
  props: PropsWithChildren<WalletConnectorProviderProps>
) => {
  const [initialized, setInitialized] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<any>(() => {
    if (props.config) {
      return props.config;
    }
  });

  if (!props.projectId) {
    console.error("WalletConnect: projectId is required");
  }

  useEffect(() => {
    // configuration web3modal
    initConfig(props.projectId, props.config).then((config) => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) return null;

  return <Main>{props.children}</Main>;
};
