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
import { AppStateProvider, AppStateProviderProps } from "./provider/appContext";

const OrderlyApp = (
  props: PropsWithChildren<OrderlyAppConfig & AppStateProviderProps>
) => {
  const { onChainChanged, ...configProps } = props;
  // const { brokerId, brokerName, networkId } = props;
  useBootstrap();
  return (
    <OrderlyThemeProvider>
      <OrderlyConfigProvider {...configProps}>
        <ModalProvider>
          <AppStateProvider onChainChanged={onChainChanged}>
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
