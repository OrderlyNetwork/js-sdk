import { FC, ReactNode } from "react";
import { OrderlyAppProvider as OrderlyAppProviderBase } from "@orderly.network/react-app";
import { orderlyAppProviderConfig } from "../../orderlyConfig";
import { dataAdapter } from "../../orderlyConfig/dataAdapter";
import { widgetConfigs } from "../../orderlyConfig/widgetConfigs";
import { useConfigStore, ConfigStoreOptions } from "./configStore";
import { useRouteContext } from "./rounteProvider";

export type OrderlyAppProviderProps = {
  children: ReactNode;
} & ConfigStoreOptions;

export const OrderlyAppProvider: FC<OrderlyAppProviderProps> = (props) => {
  const { children, ...rest } = props;
  const { onRouteChange } = useRouteContext();
  const configStore = useConfigStore(rest);

  return (
    <OrderlyAppProviderBase
      configStore={configStore}
      appIcons={orderlyAppProviderConfig.appIcons}
      restrictedInfo={orderlyAppProviderConfig.restrictedInfo}
      enableSwapDeposit={true}
      onRouteChange={onRouteChange}
      widgetConfigs={widgetConfigs}
      // dataAdapter={dataAdapter}
      // customChains={customChainsAbstarct}
      // defaultChain={{testnet: customChains.testnet[0], mainnet: customChains.mainnet[0]}}
    >
      {children}
    </OrderlyAppProviderBase>
  );
};
