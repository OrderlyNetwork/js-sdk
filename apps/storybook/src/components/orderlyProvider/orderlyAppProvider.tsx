import { FC, PropsWithChildren } from "react";
// import { registerOrderlyYoutubeLivePlugin } from "@orderly.network/youtube-live-plugin";
import { registerOnrampPlugin } from "@orderly.network/onramper-plugin";
// import { registerFastPlaceOrderPlugin } from "@orderly.network/fast-place-order-plugin";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import {
  Arbitrum,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  ArbitrumSepolia,
  ETHEREUM_MAINNET_CHAINID,
  SOLANA_TESTNET_CHAINID,
} from "@orderly.network/types";
import { cn } from "@orderly.network/ui";
import { orderlyAppProviderConfig } from "../../orderlyConfig";
import { dataAdapter } from "../../orderlyConfig/dataAdapter";
import { useSymbolList } from "../../orderlyConfig/hooks/useSymbolList";
import { notification } from "../../orderlyConfig/notification";
// import { plugins } from "../../orderlyConfig/plugins";
import { themes } from "../../orderlyConfig/themes";
import { widgetConfigs } from "../../orderlyConfig/widgetConfigs";
import { useConfigStore, ConfigStoreOptions } from "./configStore";
import { useRouteContext } from "./rounteProvider";

export type OrderlyAppRootProviderProps = ConfigStoreOptions & {
  isRwaRoute?: boolean;
};

export const OrderlyAppRootProvider: FC<
  PropsWithChildren<OrderlyAppRootProviderProps>
> = (props) => {
  const { children, isRwaRoute, ...rest } = props;
  const { onRouteChange } = useRouteContext();
  const configStore = useConfigStore(rest);
  const symbolList = useSymbolList(isRwaRoute);

  return (
    <div className={cn(isRwaRoute && "oui-rwa-route")}>
      <OrderlyAppProvider
        configStore={configStore}
        appIcons={orderlyAppProviderConfig.appIcons}
        restrictedInfo={orderlyAppProviderConfig.restrictedInfo}
        enableSwapDeposit
        onRouteChange={onRouteChange}
        widgetConfigs={widgetConfigs}
        notification={notification}
        dataAdapter={{ ...dataAdapter, symbolList }}
        plugins={[
          // registerOrderlyYoutubeLivePlugin({
          //   src: "https://www.youtube.com/embed/NOrvXR48WaY?mute=0&autoplay=1",
          //   title: "Youtube Live",
          // }),
          // registerFastPlaceOrderPlugin(),
          registerOnrampPlugin({
            apiKey: "pk_prod_01JWTGETB1H32953X7KR3DSH1S",
            secretKey: "01JWTGETB259KDVKEEVHBCGT7D",
            // workerUrl: "https://gentle-butterfly-db9c.han-eff.workers.dev/",
          }),
        ]}
        amplitudeConfig={{
          amplitudeId: "4463418c103f3a66c6d863357f951e25",
        }}
        themes={themes}
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
        // overrides={{
        //   tabs: {
        //     variant: "text",
        //   },
        // }}
      >
        {children}
      </OrderlyAppProvider>
    </div>
  );
};
