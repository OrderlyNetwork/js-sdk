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
import { AppConfigProvider } from "./provider/configContext";

const OrderlyApp = (
  props: PropsWithChildren<OrderlyAppConfig & AppStateProviderProps>
) => {
  const {
    onChainChanged,
    dateFormatting,
    components,
    appIcons,
    ...configProps
  } = props;
  useBootstrap();
  return (
    <AppConfigProvider appIcons={appIcons} brokerName={props.brokerName}>
      <OrderlyThemeProvider
        dateFormatting={dateFormatting}
        components={components}
      >
        <OrderlyConfigProvider {...configProps}>
          <ModalProvider>
            <AppStateProvider onChainChanged={onChainChanged}>
              <TooltipProvider>{props.children}</TooltipProvider>
            </AppStateProvider>
          </ModalProvider>
          <Toaster />
        </OrderlyConfigProvider>
      </OrderlyThemeProvider>
    </AppConfigProvider>
  );
};

OrderlyApp.displayName = "OrderlyApp";

export { OrderlyApp };
