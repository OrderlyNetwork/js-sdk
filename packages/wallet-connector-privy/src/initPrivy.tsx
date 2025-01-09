import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import React, { PropsWithChildren, useMemo } from "react";
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';
import { arbitrum, mainnet, okc } from "viem/chains";
const solanaConnectors = toSolanaWalletConnectors();

export function InitPrivy(props: PropsWithChildren) {
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
      supportedChains: [mainnet, okc, arbitrum],
    }
  ), [])
  // return children;
  return (
    <PrivyProvider
      appId='cm50h5kjc011111gdn7i8cd2k'
      config={privyConfig}
    >
      {props.children}
    </PrivyProvider>
  )
}