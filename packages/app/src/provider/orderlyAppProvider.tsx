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
  OrderlyTrackerProvider,
} from "@orderly.network/hooks";
import { AppStateProvider, AppStateProviderProps } from "./appContext";
import { AppConfigProvider } from "./configContext";
import { useExecutionReport } from "../hooks/useExecutionReport";
import { OrderlyThemeProviderProps } from "@orderly.network/ui/src/provider/orderlyThemeProvider";

export type OrderlyAppProviderProps = PropsWithChildren<
  OrderlyAppConfig & AppStateProviderProps & OrderlyThemeProviderProps
>;

const OrderlyAppProvider = (props: OrderlyAppProviderProps) => {
  const {
    onChainChanged,
    // dateFormatting,
    components,
    appIcons,
    ...configProps
  } = props;

  useBootstrap();
  useExecutionReport();

  return (
    <AppConfigProvider appIcons={appIcons} brokerName={props.brokerName!}>
      <OrderlyThemeProvider
        // dateFormatting={dateFormatting}
        components={components}
        overrides={props.overrides}
      >
        <OrderlyConfigProvider {...(configProps as ConfigProviderProps)}>
          <AppStateProvider
            onChainChanged={onChainChanged}
            restrictedInfo={props.restrictedInfo}
          >
            <OrderlyTrackerProvider>
              <TooltipProvider delayDuration={300}>
                <ModalProvider>{props.children}</ModalProvider>
              </TooltipProvider>
            </OrderlyTrackerProvider>
          </AppStateProvider>
          <Toaster />
        </OrderlyConfigProvider>
      </OrderlyThemeProvider>
    </AppConfigProvider>
  );
};

OrderlyAppProvider.displayName = "OrderlyAppProvider";

export { OrderlyAppProvider };
