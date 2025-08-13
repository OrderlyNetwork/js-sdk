import { Config, createConfig, http } from "@wagmi/core";
import { API } from "@orderly.network/types";

export function getWagmiConfig(chainId: number, chain: API.Chain): Config {
  return createConfig({
    chains: [
      {
        id: chainId,
        name: chain.network_infos.name,
        nativeCurrency: {
          decimals: chain.nativeToken?.decimals ?? 18,
          name: chain.network_infos.currency_symbol,
          symbol: chain.network_infos.currency_symbol,
        },
        rpcUrls: {
          default: {
            http: [chain.network_infos.public_rpc_url],
          },
        },
        blockExplorers: {
          default: {
            name: "Explorer",
            url: chain.network_infos.explorer_base_url,
          },
        },
      },
    ],
    transports: {
      [chainId]: http(),
    },
  });
}
