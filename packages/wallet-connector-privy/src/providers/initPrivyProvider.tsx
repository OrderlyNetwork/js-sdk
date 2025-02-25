import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import React, { PropsWithChildren, useMemo, useState } from "react";
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { Chain } from "viem/chains";
import { InitPrivy } from "../types";
const solanaConnectors = toSolanaWalletConnectors();


interface IProps extends PropsWithChildren {
  privyConfig: InitPrivy;
  initChains: Chain[];
}

export function InitPrivyProvider({ privyConfig, initChains, children}: IProps) {
  const config = useMemo((): PrivyClientConfig => {
    // const chains = initChains.filter((chain) => !SolanaChains.has(chain.id) )
    const chains = initChains;
    return (
      {
        appearance: {
          ...privyConfig.appearance,
          walletChainType: 'ethereum-and-solana',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        defaultChain: chains[0],
        supportedChains: chains,
      }

    )
  }, [initChains, privyConfig])
  // const privyConfig = useMemo(():PrivyClientConfig  => (
  // ), [props.initChains])
  // console.log('-- privyconfig', privyConfig);
  // return children;
  if (!initChains.length) {
    return;
  }
  return (
    <PrivyProvider
      appId={privyConfig.appid}
      config={config}
    >
      {children}
    </PrivyProvider>
  )
}