import React, { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { CustomConfigStore } from "./customConfigStore";

const configStore = new CustomConfigStore({
  networkId: "testnet",
  brokerId: "demo",
  brokerName: "Orderly",
  env: "staging",
});

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <WalletConnectorProvider>
      <OrderlyAppProvider
        // brokerId="orderly"
        // brokerName="Orderly"
        // networkId="testnet"
        configStore={configStore}
        appIcons={{
          main: {
            img: "/orderly-logo.svg",
          },
          secondary: {
            img: "/orderly-logo-secondary.svg",
          },
        }}
      >
        {props.children}
      </OrderlyAppProvider>
    </WalletConnectorProvider>
  );
};

export default OrderlyProvider;
