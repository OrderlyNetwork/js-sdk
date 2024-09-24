import { FC } from "react";
import { Box, Flex } from "@orderly.network/ui";
import { TradingV2State } from "./tradingV2.script";
import { DataListWidget } from "../components/desktop/dataList";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { AssetViewWidget } from "../components/desktop/assetView";
import { RiskRateWidget } from "../components/desktop/riskRate";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { NavBarWidget } from "../components/mWeb/navBar";
import { TopTabWidget } from "../components/mWeb/topTab";
import { OrderBookAndEntryWidget } from "../components/mWeb/orderBookAndEntry";
import { BottomTabWidget } from "../components/mWeb/bottomTab";
import { OrderBookAndTradesWidget } from "../components/desktop/orderBookAndTrades";

export const TradingV2: FC<TradingV2State> = (props) => {
  const isMobileLayout = useMediaQuery(MEDIA_TABLET);

  return isMobileLayout ? (
    <MobileLayout {...props} />
  ) : (
    <DesktopLayout {...props} />
  );
};

const MobileLayout: FC<TradingV2State> = (props) => {
  return (
    <>
      <NavBarWidget />
      <TopTabWidget />
      <OrderBookAndEntryWidget />
      <BottomTabWidget />
    </>
  );
};

const DesktopLayout: FC<TradingV2State> = (props) => {
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
      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3">
        <DataListWidget {...props.dataList} />
      </Box>

      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
        <AssetViewWidget />
      </Box>

      <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3 oui-space-y-8 oui-w-full">
        <RiskRateWidget />
      </Box>
    </Flex>
  );
};
