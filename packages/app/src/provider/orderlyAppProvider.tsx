import React, { PropsWithChildren, useMemo } from "react";
import { OrderlyConfigProvider, useTrack } from "@orderly.network/hooks";
import type { NetworkId } from "@orderly.network/types";
import {
  LocaleProvider as UILocaleProvider,
  ModalProvider,
  OrderlyPluginProvider,
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
import { AppThemeProvider } from "./appThemeProvider";

export type OrderlyAppProviderProps = PropsWithChildren<
  OrderlyAppConfig & AppStateProviderProps & OrderlyThemeProviderProps
>;

const EMPTY_PLUGINS: (OrderlyPlugin | PluginRegistrationFn)[] = [];

// Must render inside OrderlyConfigProvider (useOrderlyContext) and
// AppStateProvider (widgetConfigs gate the order notifications preference).
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
    themes,
    onChainChanged,
    defaultChain,
    widgetConfigs,
    features,
    ...configProps
  } = props;

  const configStore = configProps.configStore;
  const brokerName =
    props.brokerName ?? configStore?.get<string>("brokerName") ?? "Orderly";
  const networkId =
    configProps.networkId ??
    configStore?.get<NetworkId>("networkId") ??
    "testnet";

  useTrack();
  useBootstrap();

  const uiLocale = useUILocale();

  /**
   * Keep referential identity stable while inputs are unchanged so `OrderlyPluginProvider`
   * memo/effects (plugin list, `setup`, context) are not invalidated every parent render.
   */
  const pluginState = useMemo(
    () => ({
      config: { appIcons, brokerName },
      networkId,
    }),
    [appIcons, brokerName, networkId],
  );

  const pluginsList = plugins ?? EMPTY_PLUGINS;

  return (
    <AppConfigProvider appIcons={appIcons} brokerName={brokerName}>
      <AppThemeProvider
        // dateFormatting={dateFormatting}
        components={components}
        themes={themes}
        overrides={props.overrides}
      >
        <OrderlyConfigProvider {...configProps}>
          <OrderlyPluginProvider
            plugins={pluginsList}
            pluginState={pluginState}
          >
            <AppStateProvider
              onChainChanged={onChainChanged}
              defaultChain={defaultChain}
              restrictedInfo={props.restrictedInfo}
              onRouteChange={props.onRouteChange}
              widgetConfigs={widgetConfigs}
              features={features}
            >
              <ExecutionReportListener />
              <UILocaleProvider locale={uiLocale}>
                <TooltipProvider delayDuration={300}>
                  <ModalProvider>{props.children}</ModalProvider>
                </TooltipProvider>
              </UILocaleProvider>
            </AppStateProvider>
          </OrderlyPluginProvider>
          <Toaster />
        </OrderlyConfigProvider>
      </AppThemeProvider>
    </AppConfigProvider>
  );
};

if (process.env.NODE_ENV !== "production") {
  OrderlyAppProvider.displayName = "OrderlyAppProvider";
}

export { OrderlyAppProvider };
