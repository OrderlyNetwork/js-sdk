import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import React, { PropsWithChildren, useMemo, useState } from "react";
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';
import { arbitrum, arbitrumSepolia, Chain, mainnet, okc, storyOdyssey, storyTestnet } from "viem/chains";
import { InitPrivy } from "../types";
const solanaConnectors = toSolanaWalletConnectors();


interface IProps extends PropsWithChildren{
  privyConfig:InitPrivy;
  initChains:Chain[];
}

export function InitPrivyProvider({privyConfig, initChains, children}:IProps) {
  const config = useMemo(():PrivyClientConfig  => (
    {
      appearance: {
        theme: 'light',
        accentColor: '#676FFF',
        logo: '/next.svg',
        walletChainType: 'ethereum-and-solana',
        walletList: [],
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets'
      },
      externalWallets: {
        solana:{
          connectors: solanaConnectors,
        },
      },
      defaultChain: initChains[0],
      supportedChains: initChains,
    }
  ), [initChains, privyConfig])
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