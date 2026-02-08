import React, { PropsWithChildren, useMemo, useState } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { Chain } from "viem/chains";
import {
  AbstractChains,
  SolanaChains,
  defaultMainnetChains,
  defaultTestnetChains,
} from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import { InitPrivy } from "../../types";

interface IProps extends PropsWithChildren {
  privyConfig?: InitPrivy;
  initChains: Chain[];
}

export function InitPrivyProvider({
  privyConfig,
  initChains,
  children,
}: IProps) {
  if (!privyConfig) {
    return children;
  }
  const { network } = useWalletConnectorPrivy();
  const config = useMemo((): PrivyClientConfig => {
    // const chains = initChains.filter((chain) => !SolanaChains.has(chain.id) )
    const chains = initChains;
    const preferredDefaultChainIds = (
      network === "mainnet" ? defaultMainnetChains : defaultTestnetChains
    ).map((c) => c.id);
    const preferredDefaultChain = preferredDefaultChainIds
      .map((id) => chains.find((c) => c.id === id))
      .find((c) => !!c);
    const firstEvmChain = chains.find(
      (chain) => !SolanaChains.has(chain.id) && !AbstractChains.has(chain.id),
    );
    const defaultEvmChain = preferredDefaultChain ?? firstEvmChain ?? chains[0];
    return {
      loginMethods: privyConfig.config?.loginMethods || [
        "email",
        "google",
        "twitter",
      ],
      appearance: {
        ...privyConfig.config?.appearance,
        walletChainType: "ethereum-and-solana",
      },

      embeddedWallets: {
        ethereum: {
          createOnLogin: "all-users",
        },
        solana: {
          createOnLogin: "all-users",
        },
      },
      externalWallets: {
        walletConnect: {
          enabled: false,
        },
      },

      defaultChain: defaultEvmChain,
      supportedChains: chains,
    };
  }, [initChains, privyConfig, network]);
  // const privyConfig = useMemo(():PrivyClientConfig  => (
  // ), [props.initChains])
  // console.log('-- privyconfig', privyConfig);
  // return children;
  if (!initChains.length) {
    console.warn("initChains is empty");
    return;
  }
  return (
    <PrivyProvider appId={privyConfig.appid} config={config}>
      {children}
    </PrivyProvider>
  );
}
