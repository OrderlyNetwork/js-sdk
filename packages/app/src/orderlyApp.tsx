import { PropsWithChildren, useEffect } from "react";
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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referral_code", refCode);
    }
  }, []);

  return (
    <AppConfigProvider appIcons={appIcons} brokerName={props.brokerName}>
      <OrderlyThemeProvider
        dateFormatting={dateFormatting}
        components={components}
      >
        <OrderlyConfigProvider {...configProps}>
          <AppStateProvider onChainChanged={onChainChanged}>
            <TooltipProvider>
              <ModalProvider>{props.children}</ModalProvider>
            </TooltipProvider>
          </AppStateProvider>
          <Toaster />
        </OrderlyConfigProvider>
      </OrderlyThemeProvider>
    </AppConfigProvider>
  );
};

OrderlyApp.displayName = "OrderlyApp";

export { OrderlyApp };
