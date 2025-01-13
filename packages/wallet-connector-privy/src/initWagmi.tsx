import React, { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { createConfig, http, injected, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, Chain, mainnet, okc, sepolia } from "viem/chains";
import { metaMask, walletConnect } from "@wagmi/connectors";

interface InitWagmiProps extends PropsWithChildren {
  initialState?: any
  initChains: readonly [Chain, ...Chain[]]
}

export function InitWagmi({children, initialState, initChains}: InitWagmiProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [wagmiConfig, setWagmiConfig] = useState(() => createConfig({
    chains: initChains.length ? initChains : [mainnet],
    multiInjectedProviderDiscovery: false,
    connectors: [
      metaMask(),
      injected(),
      walletConnect({projectId: '93dba83e8d9915dc6a65ffd3ecfd19fd'}),
    ],
    transports: Object.fromEntries(
      initChains.map(chain => [
        chain.id,
        http()
      ])
    ),
  }));


  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState} >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>


  )
}