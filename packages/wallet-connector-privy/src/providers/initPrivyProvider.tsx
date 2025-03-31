import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import React, { PropsWithChildren, useMemo, useState } from "react";
import { Chain } from "viem/chains";
import { InitPrivy } from "../types";

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
  const config = useMemo((): PrivyClientConfig => {
    // const chains = initChains.filter((chain) => !SolanaChains.has(chain.id) )
    const chains = initChains;
    return {
      loginMethods: privyConfig.config?.loginMethods || ["email", "google", "twitter"],
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

      defaultChain: chains[0],
      supportedChains: chains,
    };
  }, [initChains, privyConfig]);
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
