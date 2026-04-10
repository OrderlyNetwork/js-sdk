import { FC, ReactNode } from "react";
import { onStorybookRounteChange } from "../../hooks/useStorybookNav";
import { OrderlyAppRootProvider } from "./orderlyAppProvider";
import { OrderlyLocaleProvider } from "./orderlyLocaleProvider";
import { RouteProvider } from "./rounteProvider";
import { WalletConnectorProvider } from "./walletConnectorProvider";

export const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <RouteProvider onRouteChange={onStorybookRounteChange}>
      <OrderlyLocaleProvider>
        <WalletConnectorProvider>
          <OrderlyAppRootProvider>{props.children}</OrderlyAppRootProvider>
        </WalletConnectorProvider>
      </OrderlyLocaleProvider>
    </RouteProvider>
  );
};
