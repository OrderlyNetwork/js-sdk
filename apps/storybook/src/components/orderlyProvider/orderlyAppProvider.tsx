import { FC, PropsWithChildren, useMemo } from "react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { orderlyAppProviderConfig } from "../../orderlyConfig";
import { dataAdapter } from "../../orderlyConfig/dataAdapter";
import { notification } from "../../orderlyConfig/notification";
import { getStarChildConfig } from "../../orderlyConfig/starChildConfig";
import { widgetConfigs } from "../../orderlyConfig/widgetConfigs";
import { useConfigStore, ConfigStoreOptions } from "./configStore";
import { useRouteContext } from "./rounteProvider";

export type OrderlyAppRootProviderProps = ConfigStoreOptions;

export const OrderlyAppRootProvider: FC<
  PropsWithChildren<OrderlyAppRootProviderProps>
> = (props) => {
  const { children, ...rest } = props;
  const { onRouteChange } = useRouteContext();
  const configStore = useConfigStore(rest);

  const starChildConfig = useMemo(() => {
    return getStarChildConfig(configStore);
  }, [configStore]);

  return (
    <OrderlyAppProvider
      configStore={configStore}
      appIcons={orderlyAppProviderConfig.appIcons}
      restrictedInfo={orderlyAppProviderConfig.restrictedInfo}
      enableSwapDeposit={true}
      onRouteChange={onRouteChange}
      widgetConfigs={widgetConfigs}
      notification={notification}
      dataAdapter={dataAdapter}
      amplitudeConfig={{
        amplitudeId: "4463418c103f3a66c6d863357f951e25",
      }}
      starChildConfig={starChildConfig}
      // chainFilter={(config) => {
      //   return {
      //     mainnet: [
      //       { id: ARBITRUM_MAINNET_CHAINID },
      //       { id: SOLANA_MAINNET_CHAINID },
      //     ],
      //     testnet: [
      //       { id: ARBITRUM_TESTNET_CHAINID },
      //       { id: SOLANA_TESTNET_CHAINID },
      //     ],
      //   };
      // }}
      // customChains={{
      //   mainnet: [{ id: Arbitrum.id }],
      //   testnet: [{ id: ArbitrumSepolia.id }],
      // }}

      // orderMetadata={(order) => {
      //   return {
      //     order_tag: "test_tag",
      //     client_order_id: "test_client_id",
      //   };
      // }}
      // orderMetadata={{
      //   order_tag: "test_tag",
      //   client_order_id: "test_client_id",
      // }}
      // customChains={customChainsAbstarct}
      // defaultChain={{testnet: customChains.testnet[0], mainnet: customChains.mainnet[0]}}
    >
      {children}
    </OrderlyAppProvider>
  );
};
