import { FC, ReactNode } from "react";
// import { WalletConnector } from "./walletConnector";
import { WalletConnectorPrivy } from "./walletConnectorPrivy";

type WalletConnectorProviderProps = {
  children: ReactNode;
  usePrivy?: boolean;
};

export const WalletConnectorProvider: FC<WalletConnectorProviderProps> = (
  props,
) => {
  // use privy wallet connector
  return (
    <WalletConnectorPrivy usePrivy={props.usePrivy}>
      {props.children}
    </WalletConnectorPrivy>
  );

  // use wallet-connector(web3 onboard)
  // return (
  //   <WalletConnector>
  //     {props.children}
  //   </WalletConnector>
  // );
};
