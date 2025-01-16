import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import React, { PropsWithChildren, useMemo, useState } from "react";
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';
import { arbitrum, arbitrumSepolia, Chain, mainnet, okc, storyOdyssey, storyTestnet } from "viem/chains";
const solanaConnectors = toSolanaWalletConnectors();

interface InitPrivyProps extends PropsWithChildren{
  initChains: Chain[];
}

export function InitPrivy(props:InitPrivyProps) {
  const privyConfig = useMemo(():PrivyClientConfig  => (
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
      defaultChain: arbitrumSepolia,
      supportedChains: [mainnet, okc,arbitrumSepolia, storyTestnet, storyOdyssey],
    }
  ), [])
  // const privyConfig = useMemo(():PrivyClientConfig  => (
  // ), [props.initChains])
  // console.log('-- privyconfig', privyConfig);
  // return children;
  if (!props.initChains.length) {
   return;
  }
  return (
    <PrivyProvider
      appId='cm50h5kjc011111gdn7i8cd2k'
      config={privyConfig}
    >
      {props.children}
    </PrivyProvider>
  )
}