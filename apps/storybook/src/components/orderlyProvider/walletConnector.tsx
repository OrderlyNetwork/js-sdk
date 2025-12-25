import { FC, ReactNode, useState, useEffect } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { initOnBoard } from "./web3OnboardConfig";

const networkId = import.meta.env.VITE_NETWORK_ID || "testnet";
const solanaNetwork =
  networkId === "testnet"
    ? WalletAdapterNetwork.Devnet
    : WalletAdapterNetwork.Mainnet;

export const WalletConnector: FC<{ children: ReactNode }> = (props) => {
  const [initWallet, setInitWallet] = useState(false);

  useEffect(() => {
    initOnBoard().then(() => {
      setInitWallet(true);
    });
  }, []);

  if (!initWallet) {
    return null;
  }
  return (
    <WalletConnectorProvider
      evmInitial={{
        skipInit: true,
      }}
      solanaInitial={{
        network: solanaNetwork,
      }}
    >
      {props.children}
    </WalletConnectorProvider>
  );
};
