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
import { DefaultEVMAdapterWalletAdapter } from "@orderly.network/default-evm-adapter";
import {DefaultSolanaWalletAdapter} from "@orderly.network/default-solana-adapter";
import { EthersProvider } from "@orderly.network/web3-provider-ethers";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
type OptionalConfig = Optional<OrderlyAppConfig, "walletAdapters">;

const evmWalletAdapter = new DefaultEVMAdapterWalletAdapter(
  new EthersProvider()
);
const solanaWalletAdapter = new DefaultSolanaWalletAdapter();

const OrderlyApp = (
  props: PropsWithChildren<OptionalConfig & AppStateProviderProps>
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
        <OrderlyConfigProvider
          {...configProps}
          walletAdapters={[evmWalletAdapter, solanaWalletAdapter]}
        >
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
