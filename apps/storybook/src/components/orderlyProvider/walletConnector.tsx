import { FC, ReactNode, useEffect, useState } from "react";
import { WalletConnectorProvider } from "@kodiak-finance/orderly-wallet-connector";
import { initOnBoard } from "./web3OnboardConfig";

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
    >
      {props.children}
    </WalletConnectorProvider>
  );
};
