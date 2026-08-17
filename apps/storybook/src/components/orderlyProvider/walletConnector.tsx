import { FC, ReactNode, useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import injectedWallets from "@web3-onboard/injected-wallets";
import walletConnect from "@web3-onboard/walletconnect";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import {
  WALLET_CONNECT_APP_METADATA,
  WALLET_CONNECT_PROJECT_ID,
} from "./walletConnectorConfig";

type WalletConnectorProps = {
  children: ReactNode;
  networkId?: string;
};

export const WalletConnector: FC<WalletConnectorProps> = (props) => {
  const networkId =
    props.networkId || import.meta.env.VITE_NETWORK_ID || "testnet";
  const solanaNetwork =
    networkId === "testnet"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Mainnet;
  const evmWallets = useMemo(
    () => [
      injectedWallets(),
      walletConnect({
        projectId: WALLET_CONNECT_PROJECT_ID,
        dappUrl: window.location.origin,
        qrModalOptions: { themeMode: "dark" },
      }),
    ],
    [],
  );

  return (
    <WalletConnectorProvider
      evmInitial={{
        options: {
          wallets: evmWallets,
          appMetadata: {
            name: WALLET_CONNECT_APP_METADATA.name,
            description: WALLET_CONNECT_APP_METADATA.description,
            icon: WALLET_CONNECT_APP_METADATA.icon,
            explore: WALLET_CONNECT_APP_METADATA.url,
          },
          accountCenter: {
            desktop: { enabled: false },
            mobile: { enabled: false },
          },
          connect: {
            autoConnectLastWallet: true,
          },
        },
      }}
      solanaInitial={{
        network: solanaNetwork,
      }}
    >
      {props.children}
    </WalletConnectorProvider>
  );
};
