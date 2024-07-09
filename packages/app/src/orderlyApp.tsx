import { PropsWithChildren } from "react";
import { OrderlyAppConfig } from "./types";
import {
  ModalProvider,
  OrderlyThemeProvider,
  TooltipProvider,
} from "@orderly.network/ui";
import { useBootstrap } from "./hooks/useBootstrap";
import { OrderlyConfigProvider } from "@orderly.network/hooks";
import { AppStateProvider } from "./provider/appContext";

const OrderlyApp = (props: PropsWithChildren<OrderlyAppConfig>) => {
  const { brokerId, brokerName, networkId } = props;
  useBootstrap();
  return (
    <OrderlyThemeProvider>
      <OrderlyConfigProvider
        networkId={networkId}
        brokerId={brokerId}
        configStore={props.configStore}
      >
        <ModalProvider>
          <AppStateProvider>
            <TooltipProvider>{props.children}</TooltipProvider>
          </AppStateProvider>
        </ModalProvider>
      </OrderlyConfigProvider>
    </OrderlyThemeProvider>
  );
};

OrderlyApp.displayName = "OrderlyApp";

export { OrderlyApp };
