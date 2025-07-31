import { FC, ReactNode } from "react";
import { OrderlyAppProvider as OrderlyAppProviderBase } from "@orderly.network/react-app";
import { RouteOption } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { configStore } from "./configStore";

export type OrderlyAppProviderProps = {
  onRouteChange?: (option: RouteOption) => void;
  children: ReactNode;
};

export const OrderlyAppProvider: FC<OrderlyAppProviderProps> = (props) => {
  const config = useOrderlyConfig({ onRouteChange: props.onRouteChange });

  return (
    <OrderlyAppProviderBase
      configStore={configStore}
      appIcons={config.orderlyAppProvider.appIcons}
      restrictedInfo={config.orderlyAppProvider.restrictedInfo}
      enableSwapDeposit={true}
      onRouteChange={props.onRouteChange}
      // dataAdapter={{
      //   symbolList(original) {
      //     return original.filter(
      //       (item) =>
      //         item.symbol === "PERP_SOL_USDC" ||
      //         item.symbol === "PERP_WOO_USDC" ||
      //         item.symbol === "PERP_ETH_USDC",
      //     );
      //   },
      // }}
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
