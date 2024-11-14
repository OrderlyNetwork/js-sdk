import { PropsWithChildren } from "react";
import { OrderlyAppConfig } from "../types";
import {
  ModalProvider,
  OrderlyThemeProvider,
  Toaster,
  TooltipProvider,
} from "@orderly.network/ui";
import { useBootstrap } from "../hooks/useBootstrap";
import {
  ConfigProviderProps,
  OrderlyConfigProvider,
} from "@orderly.network/hooks";
import { AppStateProvider, AppStateProviderProps } from "./appContext";
import { AppConfigProvider } from "./configContext";

import { useExecutionReport } from "../hooks/useExecutionReport";

export type OrderlyAppProviderProps = PropsWithChildren<
  OrderlyAppConfig & AppStateProviderProps
>;

const OrderlyAppProvider = (props: OrderlyAppProviderProps) => {
  const {
    onChainChanged,
    dateFormatting,
    components,
    appIcons,
    ...configProps
  } = props;

  useBootstrap();
  useExecutionReport();

  return (
    <AppConfigProvider appIcons={appIcons} brokerName={props.brokerName!}>
      <OrderlyThemeProvider
        dateFormatting={dateFormatting}
        components={components}
      >
        <OrderlyConfigProvider {...(configProps as ConfigProviderProps)}>
          <AppStateProvider onChainChanged={onChainChanged}>
            <TooltipProvider delayDuration={300}>
              <ModalProvider>{props.children}</ModalProvider>
            </TooltipProvider>
          </AppStateProvider>
          <Toaster />
        </OrderlyConfigProvider>
      </OrderlyThemeProvider>
    </AppConfigProvider>
  );
};

OrderlyAppProvider.displayName = "OrderlyAppProvider";

export { OrderlyAppProvider };
