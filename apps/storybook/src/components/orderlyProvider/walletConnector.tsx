import { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";

export const WalletConnector: FC<{ children: ReactNode }> = (props) => {
  return <WalletConnectorProvider>{props.children}</WalletConnectorProvider>;
};
