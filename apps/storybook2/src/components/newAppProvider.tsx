import { FC, PropsWithChildren } from "react";
import { OrderlyThemeProvider } from "@orderly.network/ui";
import { OrderlyConfigProvider } from "@orderly.network/hooks";
import { ConnectorProvider } from "@orderly.network/web3-onboard";

export const NewAppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ConnectorProvider skipInit>
      <OrderlyThemeProvider>
        <OrderlyConfigProvider
          networkId="testnet"
          brokerId="orderly"
          brokerName="Orderly"
        >
          {children}
        </OrderlyConfigProvider>
      </OrderlyThemeProvider>
    </ConnectorProvider>
  );
};
