import { FC, ReactNode } from "react";
// import { WalletConnector } from "./walletConnector";
import { WalletConnectorPrivy } from "./walletConnectorPrivy";

export const WalletConnectorProvider: FC<{ children: ReactNode }> = (props) => {
  // use privy wallet connector
  return <WalletConnectorPrivy>{props.children}</WalletConnectorPrivy>;

  // use wallet-connector(web3 onboard)
  // return (
  //   <WalletConnector>
  //     {props.children}
  //   </WalletConnector>
  // );
};
