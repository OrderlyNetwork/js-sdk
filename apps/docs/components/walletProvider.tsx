import { Web3OnboardProvider, init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import { FC, PropsWithChildren } from "react";
const INFURA_KEY = "";

const chains = [
  {
    id: 421613,
    label: "Arbitrum Goerli",
    token: "AGOR",
    rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
  },
];
const wallets = [injectedModule()];
const web3Onboard = init({
  wallets,
  chains,
  connect: {
    autoConnectAllPreviousWallet: true,
  },
  appMetadata: {
    name: "Orderly SDK",
    // icon: "<svg>App Icon</svg>",
    description: "A demo of Web3-Onboard.",
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
});

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      {children}
    </Web3OnboardProvider>
  );
};
