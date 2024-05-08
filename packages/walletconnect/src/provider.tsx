import React, { PropsWithChildren, useEffect, useState, useRef } from "react";
import { Web3ModalOptions, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { Config, WagmiConfig } from "wagmi";
import { arbitrum, mainnet, arbitrumGoerli } from "viem/chains";

import { ConfigOptions, initConfig } from "./config";
import { Main } from "./main";

export interface WalletConnectorProviderProps {
  projectId: string;
  config?: Config;
  metadata?: ConfigOptions["metadata"];
  modalOptions?: Web3ModalOptions;
}

export const ConnectorProvider = (
  props: PropsWithChildren<WalletConnectorProviderProps>
) => {
  if (!props.projectId) {
    throw new Error("[@orderly.network/web3-modal]: projectId is required");
  }

  // const [configurated, setConfigurated] = useState<number>(-1);

  const [initialized, setInitialized] = useState(false);

  const chains = useRef([mainnet, arbitrum, arbitrumGoerli]).current;

  // @ts-ignore
  const [wagmiConfig, setWagmiConfig] = useState<Config>(() => {
    if (props.config) {
      return props.config;
    }

    const metadata = {
      name: "Orderly",
      description: "Web3Modal for Orderly",
      url: "https://web3modal.com",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
      ...props.metadata,
    };

    return defaultWagmiConfig({ chains, projectId: props.projectId, metadata });
  });

  useEffect(() => {
    // configuration web3modal
    initConfig(props.projectId!, {
      wagmiConfig,
      modalOptions: props.modalOptions,
    }).then((config) => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) return null;

  if (typeof props.config === "undefined") {
    return (
      // @ts-ignore
      <WagmiConfig config={wagmiConfig}>
        <Main>{props.children}</Main>
      </WagmiConfig>
    );
  }

  return <Main>{props.children}</Main>;
};
