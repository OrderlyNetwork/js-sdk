import { PropsWithChildren } from "react";
import { OrderlyAppConfig } from "./types";
import {
  ModalProvider,
  OrderlyThemeProvider,
  Toaster,
  TooltipProvider,
} from "@orderly.network/ui";
import { useBootstrap } from "./hooks/useBootstrap";
import {
  ConfigProviderProps,
  OrderlyConfigProvider,
} from "@orderly.network/hooks";
import { AppStateProvider, AppStateProviderProps } from "./provider/appContext";
import { AppConfigProvider } from "./provider/configContext";
import { DefaultEVMAdapterWalletAdapter } from "@orderly.network/default-evm-adapter";
import { DefaultSolanaWalletAdapter } from "@orderly.network/default-solana-adapter";
import { EthersProvider } from "@orderly.network/web3-provider-ethers";
import { useExecutionReport } from "./hooks/useExecutionReport";

const evmWalletAdapter = new DefaultEVMAdapterWalletAdapter(
  new EthersProvider()
);
const solanaWalletAdapter = new DefaultSolanaWalletAdapter();

type OrderlyAppProps = PropsWithChildren<
  OrderlyAppConfig & AppStateProviderProps
>;

const OrderlyApp = (props: OrderlyAppProps) => {
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
        <OrderlyConfigProvider
          {...(configProps as ConfigProviderProps)}
          walletAdapters={[evmWalletAdapter, solanaWalletAdapter]}
        >
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

OrderlyApp.displayName = "OrderlyApp";

export { OrderlyApp };
