import React, { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chain, mainnet } from "viem/chains";
import {
  createConfig,
  createStorage,
  http,
  injected,
  WagmiProvider,
} from "wagmi";
import { SolanaChains, SuiChains } from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import { InitWagmi } from "../../types";

interface InitWagmiProps extends PropsWithChildren {
  initialState?: any;
  initChains: Chain[];
  wagmiConfig: InitWagmi;
}

export function InitWagmiProvider({
  children,
  initialState,
  initChains,
  wagmiConfig,
}: InitWagmiProps) {
  const { suiChainIds } = useWalletConnectorPrivy();
  const [queryClient] = useState(() => new QueryClient());

  const [config] = useState(() => {
    const wagmiChains = initChains.filter(
      (chain) =>
        !SolanaChains.has(chain.id) &&
        !SuiChains.has(chain.id) &&
        !suiChainIds.has(chain.id),
    );
    const chains =
      wagmiChains && wagmiChains.length
        ? (wagmiChains as unknown as [Chain, ...Chain[]])
        : [mainnet];

    return createConfig({
      chains,
      multiInjectedProviderDiscovery: true,
      storage: wagmiConfig.storage
        ? wagmiConfig.storage
        : createStorage({
            storage: localStorage,
            key: "wagmi",
          }),
      connectors: wagmiConfig.connectors
        ? wagmiConfig.connectors
        : [injected()],
      transports: Object.fromEntries(chains.map((chain) => [chain.id, http()])),
    });
  });

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
