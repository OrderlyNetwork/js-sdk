import React, { ReactNode, useState } from "react";
import { createConfig, http, injected, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, mainnet, okc, sepolia } from "viem/chains";
import { metaMask, walletConnect } from "@wagmi/connectors";

export function InitWagmi({children, initialState}: { children: ReactNode, initialState?: any }) {
  const [queryClient] = useState(() => new QueryClient());
  console.log('-- wagmi initial state', initialState);
  const [wagmiConfig] =  useState(() => createConfig({
    chains: [mainnet, sepolia, okc, arbitrum],
    multiInjectedProviderDiscovery:false,
    connectors: [
      metaMask(),
      injected(),
      walletConnect({projectId: '93dba83e8d9915dc6a65ffd3ecfd19fd'}),
    ],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [okc.id]:http(),
      [arbitrum.id]: http(),

    },
  }));



  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState} >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>


  )
}