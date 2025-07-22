import React, { PropsWithChildren } from "react";
import {
  ConfigProviderProps,
  OrderlyConfigProvider,
  useTrack,
} from "@orderly.network/hooks";
import {
  LocaleProvider as UILocaleProvider,
  ModalProvider,
  OrderlyThemeProvider,
  Toaster,
  TooltipProvider,
} from "@orderly.network/ui";
import { OrderlyThemeProviderProps } from "@orderly.network/ui";
import { useBootstrap } from "../hooks/useBootstrap";
import { useExecutionReport } from "../hooks/useExecutionReport";
import { useUILocale } from "../hooks/useUILocale";
import { OrderlyAppConfig } from "../types";
import { AppStateProvider, AppStateProviderProps } from "./appContext";
import { AppConfigProvider } from "./configContext";

export type OrderlyAppProviderProps = PropsWithChildren<
  OrderlyAppConfig & AppStateProviderProps & OrderlyThemeProviderProps
>;

const OrderlyAppProvider: React.FC<OrderlyAppProviderProps> = (props) => {
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
  const uiLocale = useUILocale();

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
            onRouteChange={props.onRouteChange}
          >
            <UILocaleProvider locale={uiLocale}>
              <TooltipProvider delayDuration={300}>
                <ModalProvider>{props.children}</ModalProvider>
              </TooltipProvider>
            </UILocaleProvider>
          </AppStateProvider>
          <Toaster />
        </OrderlyConfigProvider>
      </OrderlyThemeProvider>
    </AppConfigProvider>
  );
};

OrderlyAppProvider.displayName = "OrderlyAppProvider";

export { OrderlyAppProvider };
