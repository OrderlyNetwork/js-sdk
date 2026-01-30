import { SwapChainInfo } from "./type";

export const SUPPORTED_SWAP_CHAINS: SwapChainInfo[] = [
  { chainId: 56, network: "bsc" },
  { chainId: 43114, network: "avax" },
  { chainId: 137, network: "polygon" },
  { chainId: 42161, network: "arbitrum" },
  { chainId: 10, network: "optimism" },
  { chainId: 8453, network: "base" },
  { chainId: 146, network: "sonic" },
];

export const getNetworkByChainId = (chainId: number | string) => {
  return SUPPORTED_SWAP_CHAINS.find(
    (item) => item.chainId === parseInt(chainId as string),
  )?.network;
};

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const SWAP_CONTRACT_ADDRESS =
  "0xe18f1051d1cCeCb61572eb686e1beb34A8612bf3";
