import React, { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { createConfig, createStorage, http, injected, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, Chain, mainnet, okc, sepolia } from "viem/chains";
import { metaMask, walletConnect } from "@wagmi/connectors";

interface InitWagmiProps extends PropsWithChildren {
  initialState?: any;
  initChains: Chain[];
}

export function InitWagmi({ children, initialState, initChains }: InitWagmiProps) {
  const [queryClient] = useState(() => new QueryClient());

  const [wagmiConfig, setWagmiConfig] = useState(() => createConfig({
    chains: (initChains && initChains.length) ? initChains as unknown as [Chain, ...Chain[]] : [mainnet],
    multiInjectedProviderDiscovery: false,
    storage: createStorage({
      storage: localStorage,
      key: 'wagmi',
    }),
    connectors: [
      metaMask(),
      injected(),
      walletConnect({
        projectId: '93dba83e8d9915dc6a65ffd3ecfd19fd',
        showQrModal: true,
        storageOptions: {

        },
        metadata: {
          name: 'Orderly Network',
          description: 'Orderly Network',
          url: 'https://orderly.network',
          icons: ['https://oss.orderly.network/static/sdk/chains.png']
        }
      }),
    ],
    transports: Object.fromEntries(
      initChains.map(chain => [
        chain.id,
        http()
      ])
    ),
  }));


  return (

    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>

  )

}