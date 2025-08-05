import { FC, ReactNode } from "react";
import { OrderlyAppProvider as OrderlyAppProviderBase } from "@orderly.network/react-app";
import { orderlyAppProviderConfig } from "../../orderlyConfig";
import { dataAdapter } from "../../orderlyConfig/dataAdapter";
import { widgetConfigs } from "../../orderlyConfig/widgetConfigs";
import { configStore } from "./configStore";
import { useRouteContext } from "./rounteProvider";

export type OrderlyAppProviderProps = {
  children: ReactNode;
};

export const OrderlyAppProvider: FC<OrderlyAppProviderProps> = (props) => {
  const { onRouteChange } = useRouteContext();

  return (
    <OrderlyAppProviderBase
      configStore={configStore}
      appIcons={orderlyAppProviderConfig.appIcons}
      restrictedInfo={orderlyAppProviderConfig.restrictedInfo}
      enableSwapDeposit={true}
      onRouteChange={onRouteChange}
      widgetConfigs={widgetConfigs}
      // dataAdapter={dataAdapter}
      // TODO: use dataAdapter
      // overrides={{
      //   announcement: {
      //     dataAdapter: (data) => [
      //       {
      //         announcement_id: "leaderboard",
      //         message:
      //           "DAWN OF DOMINANCE: $25,000 Trading Campaign is live!",
      //         url: "https://app.orderly.network/tradingRewards",
      //         type: "Campaign",
      //       },
      //       ...data,
      //     ],
      //   },
      // }}
      // customChains={customChainsAbstarct}
      // defaultChain={{testnet: customChains.testnet[0], mainnet: customChains.mainnet[0]}}
    >
      {props.children}
    </OrderlyAppProviderBase>
  );
};
