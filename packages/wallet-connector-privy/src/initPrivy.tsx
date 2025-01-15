import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import React, { PropsWithChildren, useMemo } from "react";
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';
import { arbitrum, Chain, mainnet, okc } from "viem/chains";
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
      supportedChains: (props.initChains && props.initChains.length) ? props.initChains : [mainnet],
    }
  ), [props.initChains])
  console.log('-- privyconfig', privyConfig);
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