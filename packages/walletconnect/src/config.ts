import { WagmiConfig, Config } from "wagmi";
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
  projectId: string,
  config: {
    wagmiConfig: Config;
    modalOptions?: Web3ModalOptions;
  }
): Promise<any> => {
  if (!projectId) {
    return Promise.reject("projectId is required");
  }
  return Promise.resolve().then(() => {
    // const chains = [mainnet, arbitrum];

    console.log(projectId, config);

    const { modalOptions, wagmiConfig } = config;

    createWeb3Modal({
      wagmiConfig,
      projectId,
      chains: wagmiConfig.chains,
      themeMode: "dark",
      ...modalOptions,
    });
  });
};
