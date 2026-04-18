import React, { PropsWithChildren, useMemo } from "react";
import { OrderlyConfigProvider, useTrack } from "@orderly.network/hooks";
import {
  LocaleProvider as UILocaleProvider,
  ModalProvider,
  OrderlyPluginProvider,
  OrderlyThemeProvider,
  Toaster,
  TooltipProvider,
  type OrderlyPlugin,
  type OrderlyThemeProviderProps,
  type PluginRegistrationFn,
} from "@orderly.network/ui";
import { useBootstrap } from "../hooks/useBootstrap";
import { useExecutionReport } from "../hooks/useExecutionReport";
import { useUILocale } from "../hooks/useUILocale";
import { OrderlyAppConfig } from "../types";
import { AppConfigProvider } from "./appConfigProvider";
import { AppStateProvider, AppStateProviderProps } from "./appStateProvider";

export type OrderlyAppProviderProps = PropsWithChildren<
  OrderlyAppConfig & AppStateProviderProps & OrderlyThemeProviderProps
>;

/**
 * Reused when `plugins` is omitted so `OrderlyPluginProvider` does not receive a new
 * empty array reference on every render (which would rerun plugin resolution and setup).
 */
const EMPTY_PLUGINS: (OrderlyPlugin | PluginRegistrationFn)[] = [];

// Cannot be called outside of Provider because useExecutionReport requires useOrderlyContext.
const ExecutionReportListener: React.FC = () => {
  useExecutionReport();
  return null;
};

const OrderlyAppProvider: React.FC<OrderlyAppProviderProps> = (props) => {
  const {
    // dateFormatting,
    components,
    appIcons,
    plugins,
    onChainChanged,
    defaultChain,
    widgetConfigs,
    ...configProps
  } = props;

  useTrack();
  useBootstrap();

  const uiLocale = useUILocale();

  /**
   * Keep referential identity stable while inputs are unchanged so `OrderlyPluginProvider`
   * memo/effects (plugin list, `setup`, context) are not invalidated every parent render.
   */
  const pluginState = useMemo(
    () => ({
      config: { appIcons, brokerName: props.brokerName! },
      networkId: configProps.networkId!,
    }),
    [appIcons, props.brokerName, configProps.networkId],
  );

  const pluginsList = plugins ?? EMPTY_PLUGINS;

  return (
    <AppConfigProvider appIcons={appIcons} brokerName={props.brokerName!}>
      <OrderlyThemeProvider
        // dateFormatting={dateFormatting}
        components={components}
        overrides={props.overrides}
      >
        <OrderlyConfigProvider {...configProps}>
          <OrderlyPluginProvider
            plugins={pluginsList}
            pluginState={pluginState}
          >
            <ExecutionReportListener />
            <AppStateProvider
              onChainChanged={onChainChanged}
              defaultChain={defaultChain}
              restrictedInfo={props.restrictedInfo}
              onRouteChange={props.onRouteChange}
              widgetConfigs={widgetConfigs}
            >
              <UILocaleProvider locale={uiLocale}>
                <TooltipProvider delayDuration={300}>
                  <ModalProvider>{props.children}</ModalProvider>
                </TooltipProvider>
              </UILocaleProvider>
            </AppStateProvider>
          </OrderlyPluginProvider>
          <Toaster />
        </OrderlyConfigProvider>
      </OrderlyThemeProvider>
    </AppConfigProvider>
  );
};

if (process.env.NODE_ENV !== "production") {
  OrderlyAppProvider.displayName = "OrderlyAppProvider";
}

export { OrderlyAppProvider };
