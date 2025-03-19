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
  useTrack,
} from "@orderly.network/hooks";
import { AppStateProvider, AppStateProviderProps } from "./appContext";
import { AppConfigProvider } from "./configContext";
import { useExecutionReport } from "../hooks/useExecutionReport";
import { OrderlyThemeProviderProps } from "@orderly.network/ui";

export type OrderlyAppProviderProps = PropsWithChildren<
  OrderlyAppConfig & AppStateProviderProps & OrderlyThemeProviderProps
>;

const OrderlyAppProvider = (props: OrderlyAppProviderProps) => {
  const {
    // dateFormatting,
    components,
    appIcons,
    onChainChanged,
    defaultChain,
    ...configProps
  } = props;

  useTrack();
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
            defaultChain={defaultChain}
            restrictedInfo={props.restrictedInfo}
          >
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
