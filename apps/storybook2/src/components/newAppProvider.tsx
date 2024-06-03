import { FC, PropsWithChildren } from "react";
import { OrderlyThemeProvider } from "@orderly.network/ui";
import { OrderlyConfigProvider } from "@orderly.network/hooks";

export const NewAppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <OrderlyThemeProvider>
      <OrderlyConfigProvider networkId={"testnet"} brokerId={"orderly"}>
        {children}
      </OrderlyConfigProvider>
    </OrderlyThemeProvider>
  );
};
