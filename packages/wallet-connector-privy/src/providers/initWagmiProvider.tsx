import React, { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { createConfig, createStorage, http, injected, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, Chain, mainnet, okc, sepolia } from "viem/chains";
import { InitWagmi } from "../types";
interface InitWagmiProps extends PropsWithChildren {
  initialState?: any;
  initChains: Chain[];
  wagmiConfig:InitWagmi;
}

export function InitWagmiProvider({ children, initialState, initChains, wagmiConfig }: InitWagmiProps) {
  const [queryClient] = useState(() => new QueryClient());

  const [config, setConfig] = useState(() => createConfig({
    chains: (initChains && initChains.length) ? initChains as unknown as [Chain, ...Chain[]] : [mainnet],
    multiInjectedProviderDiscovery: true,
    storage: wagmiConfig.storage ? wagmiConfig.storage : createStorage({
      storage: localStorage,
      key: 'wagmi',
    }),
    connectors: wagmiConfig.connectors ? wagmiConfig.connectors : [
      injected(),
    ],
    transports: Object.fromEntries(
      initChains.map(chain => [
        chain.id,
        http()
      ])
    ),
  }));

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}