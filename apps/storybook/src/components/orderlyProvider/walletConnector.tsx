import { FC, ReactNode, useState, useEffect } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useThemeAttribute } from "@orderly.network/ui";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { initOnBoard, themeIdToOnboardPreset } from "./web3OnboardConfig";

const networkId = import.meta.env.VITE_NETWORK_ID || "testnet";
const solanaNetwork =
  networkId === "testnet"
    ? WalletAdapterNetwork.Devnet
    : WalletAdapterNetwork.Mainnet;

export const WalletConnector: FC<{ children: ReactNode }> = (props) => {
  const themeId = useThemeAttribute();
  const [initWallet, setInitWallet] = useState(false);

  useEffect(() => {
    const theme = themeIdToOnboardPreset(themeId);
    initOnBoard(theme).then(() => {
      setInitWallet(true);
    });
  }, [themeId]);

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
