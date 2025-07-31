import { FC, ReactNode } from "react";
import { onStorybookRounteChange } from "../../hooks/useStorybookNav";
import { LocaleProvider } from "./localeProvider";
import { OrderlyAppProvider } from "./orderlyAppProvider";
import { WalletConnectorProvider } from "./walletConnectorProvider";

export const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <LocaleProvider>
      <WalletConnectorProvider>
        <OrderlyAppProvider onRouteChange={onStorybookRounteChange}>
          {props.children}
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    </LocaleProvider>
  );
};
