import { WagmiConfig } from "wagmi";
import { arbitrum, mainnet } from "viem/chains";
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3ModalOptions,
} from "@web3modal/wagmi/react";

export interface ConfigOptions {
  projectId: string;
  chains: any[];
  metadata?: {
    name?: string;
    description?: string;
    url?: string;
    icons?: string[];
    verifyUrl?: string;
  };
  enableInjected?: boolean;
  enableEIP6963?: boolean;
  enableCoinbase?: boolean;
  enableEmail?: boolean;
  enableWalletConnect?: boolean;
}

export const initConfig = (
  projectId?: string,
  config?: Web3ModalOptions
): Promise<any> => {
  if (!projectId) {
    return Promise.reject("projectId is required");
  }
  return Promise.resolve().then(() => {
    const chains = [mainnet, arbitrum];
    const metadata = {
      name: "Web3Modal",
      description: "Web3Modal Example",
      url: "https://web3modal.com",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };
    const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
    createWeb3Modal({
      wagmiConfig,
      projectId,
      chains,
      themeMode: "dark",
      ...config,
    });
  });
};
