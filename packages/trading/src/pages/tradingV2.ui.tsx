import { FC } from "react";
import { Box, Flex, Text } from "@orderly.network/ui";
import { TradingV2State } from "./tradingV2.script";
import { DataListWidget } from "../components/dataList";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { LastTradesWidget } from "../components/lastTrades";
import { AssetViewWidget } from "../components/assetView";
import { RiskRateWidget } from "../components/riskRate";
import { OrderBookAndTradesWidget } from "../components/orderBookAndTrades";

export const TradingV2: FC<TradingV2State> = (props) => {
  return (
    <Flex direction={"column"} gap={3} p={3} className="oui-bg-base-10">
      <Flex p={3} width={"100%"} height={600} gap={3}>
        <Box className="oui-flex-1" width={"100%"} height={"100%"}>
          <TradingviewWidget
            symbol={props.symbol}
            libraryPath={props.tradingViewConfig?.library_path}
            scriptSRC={props.tradingViewConfig?.scriptSRC}
            customCssUrl={props.tradingViewConfig?.customCssUrl}
          />
        </Box>
        <Box className="oui-flex-1" width={"100%"} height={"100%"}>
          <OrderBookAndTradesWidget symbol={props.symbol} />
        </Box>
      </Flex>
      <Box p={3} width={"100%"} height={300} r="xl" className="oui-bg-base-9">
        <LastTradesWidget symbol="PERP_ETH_USDC" />
      </Box>
      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3">
        <DataListWidget {...props.dataList} />
      </Box>

      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
        <AssetViewWidget />
        <RiskRateWidget />
      </Box>
    </Flex>
  );
};
