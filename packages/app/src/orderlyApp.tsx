import { PropsWithChildren } from "react";
import { OrderlyAppConfig } from "./types";
import {
  ModalProvider,
  OrderlyThemeProvider,
  Toaster,
  TooltipProvider,
} from "@orderly.network/ui";
import { useBootstrap } from "./hooks/useBootstrap";
import { OrderlyConfigProvider } from "@orderly.network/hooks";
import { AppStateProvider } from "./provider/appContext";

const OrderlyApp = (props: PropsWithChildren<OrderlyAppConfig>) => {
  // const { brokerId, brokerName, networkId } = props;
  useBootstrap();
  return (
    <OrderlyThemeProvider>
      <OrderlyConfigProvider {...props}>
        <ModalProvider>
          <AppStateProvider>
            <TooltipProvider>{props.children}</TooltipProvider>
          </AppStateProvider>
        </ModalProvider>
        <Toaster />
      </OrderlyConfigProvider>
    </OrderlyThemeProvider>
  );
};

OrderlyApp.displayName = "OrderlyApp";

export { OrderlyApp };
